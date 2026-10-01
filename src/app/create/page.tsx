'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent, type ReactNode } from 'react';
import { PhotoCardBody } from '@/components/photography/PhotographyCard';
import Button, { buttonClasses } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';
import { CheckIcon, CloseIcon, UploadIcon } from '@/components/ui/icons';
import { useWallet } from '@/components/wallet/WalletProvider';
import { serif } from '@/lib/fonts';
import { cn } from '@/lib/format';
import { DEMO_WALLET } from '@/data/photography';
import { txUrl } from '@/lib/chain';
import { IS_ONCHAIN, mintArtwork, toFriendlyError } from '@/lib/market';
import { CATEGORY_LABELS, LICENSE_LABELS } from '@/lib/labels';
import { getDisplayName } from '@/lib/photography';
import { CATEGORIES, LICENSES, type Category, type License } from '@/types/photography';

const MAX_SIZE_MB = 20;
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'];

interface FormState {
  title: string;
  description: string;
  category: Category | '';
  license: License;
  price: string;
  royalty: number;
}

type Errors = Partial<Record<keyof FormState | 'file', string>>;

const INITIAL: FormState = {
  title: '',
  description: '',
  category: '',
  license: 'Personal Use',
  price: '',
  royalty: 5,
};

const inputClass =
  'w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-600 transition-colors focus:border-white/30 focus:outline-none aria-[invalid=true]:border-red-500/60';

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-white">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-400">{error}</p>
      ) : (
        hint && <p className="mt-2 text-xs text-zinc-500">{hint}</p>
      )}
    </div>
  );
}

function validate(form: FormState, file: File | null): Errors {
  const e: Errors = {};
  if (!file) e.file = 'Vui lòng tải ảnh lên.';
  if (form.title.trim().length < 3) e.title = 'Tên tác phẩm cần ít nhất 3 ký tự.';
  if (form.description.trim().length < 10) e.description = 'Hãy kể thêm một chút về bức ảnh (tối thiểu 10 ký tự).';
  if (!form.category) e.category = 'Vui lòng chọn thể loại.';
  const price = Number(form.price);
  if (!form.price || Number.isNaN(price) || price < 0.001) e.price = 'Giá tối thiểu là 0.001 ETH.';
  if (form.royalty < 0 || form.royalty > 10) e.royalty = 'Tiền bản quyền phải từ 0% đến 10%.';
  return e;
}

export default function CreatePage() {
  const { address, connect, status: walletStatus } = useWallet();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'minting' | 'success'>('idle');
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /** Set (or clear) the photo and manage its preview object URL. */
  const setPhoto = (next: File | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = next ? URL.createObjectURL(next) : null;
    setFile(next);
    setPreviewUrl(urlRef.current);
  };

  // Free the object URL when leaving the page (cleanup only – no setState).
  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const pickFile = (f?: File | null) => {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) return setErrors((e) => ({ ...e, file: 'Chỉ nhận file PNG, JPG hoặc WEBP.' }));
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return setErrors((e) => ({ ...e, file: `File lớn hơn ${MAX_SIZE_MB}MB.` }));
    setPhoto(f);
    setErrors((e) => ({ ...e, file: undefined }));
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(form, file);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    // No browser wallet installed → allow a demo mint so the flow can still be tested.
    // On-chain bắt buộc có ví. Demo mà máy không có ví → dùng ví mẫu để vẫn thử được.
    if (!address && (IS_ONCHAIN || walletStatus !== 'unavailable')) {
      await connect();
      return;
    }
    if (!file || !form.category) return;

    setStatus('minting');
    setSubmitError(null);
    try {
      const result = await mintArtwork(
        {
          file,
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          license: form.license,
          price: form.price,
          royalty: form.royalty,
        },
        address ?? DEMO_WALLET,
      );
      setCreatedId(result.id || null);
      setTxHash(result.txHash ?? null);
      setStatus('success');
    } catch (err) {
      setStatus('idle');
      setSubmitError(toFriendlyError(err));
    }
  };

  const resetAll = () => {
    setForm(INITIAL);
    setPhoto(null);
    setErrors({});
    setCreatedId(null);
    setTxHash(null);
    setSubmitError(null);
    setStatus('idle');
  };

  if (status === 'success') {
    return (
      <Container className="flex flex-col items-center py-24 text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
          <CheckIcon size={28} />
        </div>
        <h1 className={cn(serif.className, 'text-5xl text-white')}>Đã tạo tác phẩm</h1>
        <p className="mt-4 max-w-md text-zinc-400">
          “{form.title}” đã được thêm vào bộ sưu tập của bạn.{' '}
          {IS_ONCHAIN
            ? 'Tác phẩm đã được mint lên blockchain.'
            : 'Chế độ demo: tác phẩm chỉ lưu trong trình duyệt này, chưa ghi lên blockchain.'}
        </p>
        {txHash && (
          <p className="mt-2 font-mono text-xs text-zinc-500" title={txHash}>
            {txUrl(txHash) ? (
              <a href={txUrl(txHash)!} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">
                Xem giao dịch {txHash.slice(0, 12)}… trên explorer ↗
              </a>
            ) : (
              <>tx {txHash.slice(0, 18)}…</>
            )}
          </p>
        )}
        <div className="mt-10 w-64">
          <PhotoCardBody
            image={previewUrl}
            title={form.title}
            creatorName={getDisplayName(address ?? undefined)}
            category={form.category ? CATEGORY_LABELS[form.category] : undefined}
            price={Number(form.price)}
            royalty={form.royalty}
          />
        </div>
        <div className="mt-10 flex gap-3">
          {createdId && (
            <Link href={`/photo/${createdId}`} className={buttonClasses('primary')}>Xem tác phẩm</Link>
          )}
          <Link href="/collection" className={buttonClasses('secondary')}>Xem bộ sưu tập</Link>
          <Button variant="ghost" onClick={resetAll}>Tạo tác phẩm khác</Button>
        </div>
      </Container>
    );
  }

  const errorProps = (key: keyof Errors) =>
    errors[key] ? { 'aria-invalid': true, 'aria-describedby': `${key}-error` } : {};

  return (
    <Container className="py-12 lg:py-16">
      <Reveal className="mb-12">
        <header>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Mint NFT</p>
          <h1 className={cn(serif.className, 'text-5xl text-white md:text-6xl')}>Tạo tác phẩm</h1>
          <p className="mt-3 text-lg text-zinc-400">Biến bức ảnh của bạn thành tác phẩm sưu tầm số độc bản.</p>
        </header>
      </Reveal>

      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        <form noValidate onSubmit={onSubmit} className="space-y-8">
          {/* Upload */}
          <div>
            <p className="mb-2 text-sm font-medium text-white">Ảnh</p>
            <label
              htmlFor="file"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                'group relative flex min-h-[16rem] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed p-10 text-center transition-colors focus-within:border-white/40',
                dragging ? 'border-violet-400 bg-violet-500/5' : 'border-white/15 hover:border-white/30 hover:bg-white/[0.02]',
                errors.file && 'border-red-500/60',
              )}
            >
              <input
                id="file"
                type="file"
                accept={ACCEPTED.join(',')}
                className="sr-only"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  pickFile(e.target.files?.[0]);
                  e.target.value = ''; // allow re-selecting the same file
                }}
                {...errorProps('file')}
              />
              {file ? (
                <div className="flex items-center gap-3 text-left">
                  <CheckIcon size={20} className="text-emerald-400" />
                  <div>
                    <p className="font-medium text-white">{file.name}</p>
                    <p className="text-sm text-zinc-500">{(file.size / 1024 / 1024).toFixed(1)} MB · bấm để đổi ảnh khác</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Bỏ ảnh"
                    onClick={(e) => {
                      e.preventDefault();
                      setPhoto(null);
                    }}
                    className="ml-4 rounded-full p-1.5 text-zinc-500 hover:bg-white/10 hover:text-white"
                  >
                    <CloseIcon size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-zinc-400 transition-colors group-hover:text-white">
                    <UploadIcon size={20} />
                  </div>
                  <p className="font-medium text-white">Kéo ảnh vào đây hoặc bấm để chọn file</p>
                  <p className="mt-1 text-sm text-zinc-500">PNG, JPG hoặc WEBP · tối đa {MAX_SIZE_MB}MB</p>
                </>
              )}
            </label>
            {errors.file && <p id="file-error" className="mt-2 text-sm text-red-400">{errors.file}</p>}
          </div>

          <Field id="title" label="Tên tác phẩm" error={errors.title}>
            <input id="title" value={form.title} maxLength={80} onChange={(e) => update('title', e.target.value)} placeholder="VD: Hoàng hôn Đà Nẵng" className={inputClass} {...errorProps('title')} />
          </Field>

          <Field id="description" label="Mô tả" hint="Câu chuyện phía sau bức ảnh — chụp ở đâu, khi nào, vì sao." error={errors.description}>
            <textarea id="description" rows={4} value={form.description} maxLength={1000} onChange={(e) => update('description', e.target.value)} placeholder="Kể câu chuyện phía sau bức ảnh của bạn…" className={cn(inputClass, 'resize-y')} {...errorProps('description')} />
          </Field>

          <div className="grid gap-8 md:grid-cols-2">
            <Field id="category" label="Thể loại" error={errors.category}>
              <select id="category" value={form.category} onChange={(e) => update('category', e.target.value as Category)} className={cn(inputClass, 'cursor-pointer')} {...errorProps('category')}>
                <option value="" disabled>Chọn thể loại</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </Field>

            <Field id="license" label="Giấy phép sử dụng">
              <select id="license" value={form.license} onChange={(e) => update('license', e.target.value as License)} className={cn(inputClass, 'cursor-pointer')}>
                {LICENSES.map((l) => <option key={l} value={l}>{LICENSE_LABELS[l]}</option>)}
              </select>
            </Field>

            <Field id="price" label="Giá bán" error={errors.price}>
              <div className="relative">
                <input id="price" type="number" inputMode="decimal" step="0.001" min="0.001" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="0.50" className={cn(inputClass, 'pr-14 font-mono')} {...errorProps('price')} />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">ETH</span>
              </div>
            </Field>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <label htmlFor="royalty" className="text-sm font-medium text-white">Tiền bản quyền</label>
                <span className="font-mono text-white">{form.royalty}%</span>
              </div>
              <input id="royalty" type="range" min={0} max={10} step={0.5} value={form.royalty} onChange={(e) => update('royalty', Number(e.target.value))} className="mt-3 w-full cursor-pointer accent-white" />
              <div className="mt-1 flex justify-between text-xs text-zinc-600"><span>0%</span><span>10%</span></div>
              <p className="mt-2 text-xs text-zinc-500">Bạn nhận khoản này mỗi lần tác phẩm được bán lại trên PhotoChain.</p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <Button type="submit" variant="accent" size="lg" className="w-full" disabled={status === 'minting' || walletStatus === 'connecting'}>
              {status === 'minting'
                ? IS_ONCHAIN
                  ? 'Đang chờ MetaMask xác nhận…'
                  : 'Đang tạo…'
                : address || (!IS_ONCHAIN && walletStatus === 'unavailable')
                  ? 'Tạo tác phẩm'
                  : 'Kết nối ví để tạo'}
            </Button>
            {submitError && (
              <p role="alert" className="mt-3 text-center text-sm text-red-300">
                {submitError}
              </p>
            )}
            {!address && (
              <p className="mt-3 text-center text-xs text-zinc-500">
                {!IS_ONCHAIN && walletStatus === 'unavailable'
                  ? 'Không tìm thấy ví – đang chạy chế độ demo.'
                  : 'Bạn sẽ được yêu cầu kết nối ví trước khi mint.'}
              </p>
            )}
          </div>
        </form>

        {/* Live preview */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-4 text-sm font-medium text-white">Xem trước</p>
          <PhotoCardBody
            image={previewUrl}
            title={form.title || 'Tác phẩm chưa đặt tên'}
            creatorName={address ? getDisplayName(address) : 'Bạn'}
            category={form.category ? CATEGORY_LABELS[form.category] : undefined}
            price={form.price ? Number(form.price) : null}
            royalty={form.royalty}
            isListed={!!form.price}
          />
          <p className="mt-4 text-xs text-zinc-500">Nhà sưu tầm sẽ thấy tác phẩm của bạn trên chợ ảnh như thế này.</p>
        </aside>
      </div>
    </Container>
  );
}
