import { expect } from 'chai';
import { ethers } from 'hardhat';

const ETH = (v: string) => ethers.parseEther(v);

async function deploy() {
  const [deployer, creator, buyer, buyer2] = await ethers.getSigners();
  const contract = await (await ethers.getContractFactory('PhotoChain')).deploy();
  return { contract, deployer, creator, buyer, buyer2 };
}

describe('PhotoChain', () => {
  it('mint: lưu tác giả, tokenURI, royalty và rao bán luôn nếu có giá', async () => {
    const { contract, creator } = await deploy();
    await expect(contract.connect(creator).mint('ipfs://a', 500, ETH('1')))
      .to.emit(contract, 'Minted').withArgs(1n, creator.address, 500n)
      .and.to.emit(contract, 'Listed').withArgs(1n, creator.address, ETH('1'));

    const t = await contract.getToken(1);
    expect(t.owner).to.equal(creator.address);
    expect(t.creator).to.equal(creator.address);
    expect(t.price).to.equal(ETH('1'));
    expect(t.royaltyBps).to.equal(500n);
    expect(t.uri).to.equal('ipfs://a');
    expect(await contract.totalMinted()).to.equal(1n);
  });

  it('mint: chặn royalty > 10%', async () => {
    const { contract, creator } = await deploy();
    await expect(contract.connect(creator).mint('x', 1001, 0)).to.be.revertedWithCustomError(contract, 'RoyaltyTooHigh');
  });

  it('buy lần đầu: tác giả nhận toàn bộ, không tính royalty', async () => {
    const { contract, creator, buyer } = await deploy();
    await contract.connect(creator).mint('x', 1000, ETH('1'));
    await expect(contract.connect(buyer).buy(1, { value: ETH('1') }))
      .to.changeEtherBalances([creator, buyer], [ETH('1'), -ETH('1')]);
    expect(await contract.ownerOf(1)).to.equal(buyer.address);
    expect(await contract.priceOf(1)).to.equal(0n);
  });

  it('buy bán lại: tác giả nhận royalty, người bán nhận phần còn lại', async () => {
    const { contract, creator, buyer, buyer2 } = await deploy();
    await contract.connect(creator).mint('x', 1000, ETH('1')); // 10%
    await contract.connect(buyer).buy(1, { value: ETH('1') });
    await contract.connect(buyer).list(1, ETH('2'));

    const tx = contract.connect(buyer2).buy(1, { value: ETH('2') });
    await expect(tx).to.changeEtherBalances([creator, buyer, buyer2], [ETH('0.2'), ETH('1.8'), -ETH('2')]);
    await expect(tx).to.emit(contract, 'Sold').withArgs(1n, buyer.address, buyer2.address, ETH('2'), ETH('0.2'));
  });

  it('buy: sai số tiền / chưa rao bán / tự mua đều bị chặn', async () => {
    const { contract, creator, buyer } = await deploy();
    await contract.connect(creator).mint('x', 500, ETH('1'));
    await expect(contract.connect(buyer).buy(1, { value: ETH('0.5') })).to.be.revertedWithCustomError(contract, 'WrongPayment');
    await expect(contract.connect(creator).buy(1, { value: ETH('1') })).to.be.revertedWithCustomError(contract, 'CannotBuyOwnToken');
    await contract.connect(creator).unlist(1);
    await expect(contract.connect(buyer).buy(1, { value: ETH('1') })).to.be.revertedWithCustomError(contract, 'NotListed');
  });

  it('list/unlist: chỉ chủ sở hữu được thao tác', async () => {
    const { contract, creator, buyer } = await deploy();
    await contract.connect(creator).mint('x', 500, 0);
    await expect(contract.connect(buyer).list(1, ETH('1'))).to.be.revertedWithCustomError(contract, 'NotTokenOwner');
    await expect(contract.connect(creator).list(1, 0)).to.be.revertedWithCustomError(contract, 'InvalidPrice');
    await contract.connect(creator).list(1, ETH('1'));
    await expect(contract.connect(buyer).unlist(1)).to.be.revertedWithCustomError(contract, 'NotTokenOwner');
  });

  it('chuyển token bằng transferFrom sẽ huỷ tin rao bán', async () => {
    const { contract, creator, buyer } = await deploy();
    await contract.connect(creator).mint('x', 500, ETH('1'));
    await expect(contract.connect(creator).transferFrom(creator.address, buyer.address, 1))
      .to.emit(contract, 'Unlisted').withArgs(1n);
    expect(await contract.priceOf(1)).to.equal(0n);
  });

  it('hỗ trợ interface ERC-721 và ERC-2981', async () => {
    const { contract } = await deploy();
    expect(await contract.supportsInterface('0x80ac58cd')).to.equal(true); // ERC-721
    expect(await contract.supportsInterface('0x2a55205a')).to.equal(true); // ERC-2981
  });
});
