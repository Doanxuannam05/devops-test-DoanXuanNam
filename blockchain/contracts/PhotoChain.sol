// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title PhotoChain – NFT ảnh nghệ thuật có chợ mua bán và tiền bản quyền (ERC-2981)
/// @notice Mỗi token là một bức ảnh độc bản. Người sở hữu có thể rao bán; khi bán lại,
///         hợp đồng tự chuyển tiền bản quyền cho tác giả và phần còn lại cho người bán.
contract PhotoChain is ERC721URIStorage, ERC2981, ReentrancyGuard {
    /// @notice Tiền bản quyền tối đa: 10% (1000 basis points)
    uint96 public constant MAX_ROYALTY_BPS = 1_000;

    uint256 private _nextTokenId = 1;

    /// @notice Tác giả (người mint) của từng token
    mapping(uint256 tokenId => address) public creatorOf;
    /// @notice Giá rao bán hiện tại (wei). 0 = không rao bán
    mapping(uint256 tokenId => uint256) public priceOf;

    event Minted(uint256 indexed tokenId, address indexed creator, uint96 royaltyBps);
    event Listed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event Unlisted(uint256 indexed tokenId);
    event Sold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price, uint256 royalty);

    error NotTokenOwner();
    error NotListed();
    error WrongPayment(uint256 expected, uint256 sent);
    error RoyaltyTooHigh();
    error InvalidPrice();
    error CannotBuyOwnToken();
    error PaymentFailed();

    constructor() ERC721("PhotoChain", "PHOTO") {}

    // ---------------------------------------------------------------- write

    /// @notice Mint một tác phẩm mới. Nếu `price` > 0 thì rao bán luôn.
    /// @param uri        tokenURI (metadata JSON: ipfs://, https:// hoặc data:)
    /// @param royaltyBps tiền bản quyền, đơn vị basis point (500 = 5%)
    /// @param price      giá rao bán (wei), 0 = chưa bán
    function mint(string calldata uri, uint96 royaltyBps, uint256 price) external returns (uint256 tokenId) {
        if (royaltyBps > MAX_ROYALTY_BPS) revert RoyaltyTooHigh();

        tokenId = _nextTokenId++;
        creatorOf[tokenId] = msg.sender;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        _setTokenRoyalty(tokenId, msg.sender, royaltyBps);
        emit Minted(tokenId, msg.sender, royaltyBps);

        if (price > 0) {
            priceOf[tokenId] = price;
            emit Listed(tokenId, msg.sender, price);
        }
    }

    /// @notice Rao bán (hoặc đổi giá) một token bạn đang sở hữu.
    function list(uint256 tokenId, uint256 price) external {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (price == 0) revert InvalidPrice();
        priceOf[tokenId] = price;
        emit Listed(tokenId, msg.sender, price);
    }

    /// @notice Ngừng rao bán.
    function unlist(uint256 tokenId) external {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (priceOf[tokenId] == 0) revert NotListed();
        delete priceOf[tokenId];
        emit Unlisted(tokenId);
    }

    /// @notice Mua token đang rao bán. Gửi kèm đúng số ETH bằng giá.
    ///         Bán lần đầu (người bán là tác giả): tác giả nhận toàn bộ.
    ///         Bán lại: tác giả nhận tiền bản quyền, người bán nhận phần còn lại.
    function buy(uint256 tokenId) external payable nonReentrant {
        uint256 price = priceOf[tokenId];
        if (price == 0) revert NotListed();
        if (msg.value != price) revert WrongPayment(price, msg.value);

        address seller = ownerOf(tokenId);
        if (seller == msg.sender) revert CannotBuyOwnToken();

        (address royaltyReceiver, uint256 royalty) = royaltyInfo(tokenId, price);
        if (royaltyReceiver == seller) royalty = 0; // bán lần đầu – tác giả nhận trọn giá

        // Effects trước, interactions sau (listing tự bị xoá trong _update)
        _transfer(seller, msg.sender, tokenId);

        if (royalty > 0) _pay(royaltyReceiver, royalty);
        _pay(seller, price - royalty);

        emit Sold(tokenId, seller, msg.sender, price, royalty);
    }

    // ----------------------------------------------------------------- read

    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /// @notice Đọc toàn bộ thông tin một token trong 1 lần gọi (tiện cho frontend).
    function getToken(uint256 tokenId)
        external
        view
        returns (address owner, address creator, uint256 price, uint96 royaltyBps, string memory uri)
    {
        owner = ownerOf(tokenId);
        creator = creatorOf[tokenId];
        price = priceOf[tokenId];
        (, uint256 bps) = royaltyInfo(tokenId, 10_000);
        royaltyBps = uint96(bps);
        uri = tokenURI(tokenId);
    }

    // ------------------------------------------------------------- internal

    function _pay(address to, uint256 amount) private {
        (bool ok, ) = payable(to).call{value: amount}("");
        if (!ok) revert PaymentFailed();
    }

    /// @dev Mọi lần chuyển token (kể cả transferFrom thông thường) đều huỷ tin rao bán cũ.
    function _update(address to, uint256 tokenId, address auth) internal override returns (address from) {
        from = super._update(to, tokenId, auth);
        if (from != address(0) && priceOf[tokenId] != 0) {
            delete priceOf[tokenId];
            emit Unlisted(tokenId);
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
