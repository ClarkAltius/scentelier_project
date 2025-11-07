import { useState, useEffect} from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';

export default function ProductEditModal({ show, product, onClose, onSaved }) {

   const asEnumString = (c) => {
    if (c == null) return '';
    if (typeof c === 'string') return c;           // "CITRUS"
    if (typeof c === 'object') return c.value || c.name || '';
    return String(c);
  };
  const asSeasonString = (s) => {
    if (s == null || s === '') return '';
    // 서버가 enum 문자열(SPRING...)을 주면 그대로, 숫자/ordinal이면 매핑
    if (typeof s === 'string') return s;
    const map = { 0: 'SPRING', 1: 'SUMMER', 2: 'FALL', 3: 'WINTER' };
    return map[s] || '';
  };

  const [form, setForm] = useState(() => ({
  id: product.id,
  name: product.name ?? '',
  category: asEnumString(product.category) ?? '',
  price: Number(product.price ?? 0),
  stock: Number(product.stock ?? 0),
  description: product.description ?? '',
  imageUrl: product.imageUrl ?? '',
  season: product.season ?? '',
  keyword: product.keyword ?? '',
}));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 신규 선택된 파일(실제 업로드할 원본) + 미리보기 URL
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(() =>
    product.imageUrl ? `${API_BASE_URL}/uploads/products/${product.imageUrl}` : ''
  );

  useEffect(() => {
  setForm({
    id: product.id,
    name: product.name ?? '',
    category: asEnumString(product.category) ?? '',
    price: Number(product.price ?? 0),
    stock: Number(product.stock ?? 0),
    description: product.description ?? '',
    imageUrl: product.imageUrl ?? '',
    season: product.season ?? '',
    keyword: product.keyword ?? '',
  });
  setFile(null);
  setPreview(product.imageUrl ? `${API_BASE_URL}/uploads/products/${product.imageUrl}` : '');
  setError(null);
}, [product]);

   // 카테고리 ENUM → 라벨 매핑
 const CATEGORY_OPTIONS = [
   { value: 'CITRUS',  label: '시트러스' },
   { value: 'FLORAL',  label: '플로럴' },
   { value: 'WOODY',   label: '우디' },
   { value: 'CHYPRE',  label: '시프레' },
   { value: 'GREEN',   label: '그린' },
   { value: 'FRUITY',  label: '프루티' },
   { value: 'POWDERY', label: '파우더리' },
   { value: 'CRYSTAL', label: '크리스탈' },
 ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const v = (name === 'price' || name === 'stock') ? Number(value) : value;
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  // 파일 업로드 → filename 응답 → POST로 상품 수정
  const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  setError(null);

  try {
    let filename = form.imageUrl;

    // 1) 새 파일 업로드 (POST /product/{id}/image)
    if (file) {
      const fd = new FormData();
      fd.append('image', file); // 서버 @RequestParam("image")
      const up = await axios.post(
        `${API_BASE_URL}/product/${encodeURIComponent(form.id)}/image`,
        fd,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      filename = up?.data?.filename || up?.data?.image || up?.data?.fileName || filename;
      if (!filename) throw new Error('이미지 업로드 응답에 파일명이 없습니다.');
    }

    // 2) 본문 페이로드
    // const payload = {
    //   name: String(form.name ?? '').trim(),
    //   category: asEnumString(form.category),         // "CITRUS"
    //   price: Number.isFinite(Number(form.price)) ? Number(form.price) : 0,
    //   stock: Number.isFinite(Number(form.stock)) ? Number(form.stock) : 0,
    //   description: String(form.description ?? ''),
    //   imageUrl: filename,
    //   season: asSeasonString(form.season) || null,   // "SPRING"|...|null
    //   keyword: String(form.keyword ?? '').trim(),
    // };

    const payload = {
  name: form.name,
  category: asEnumString(form.category)?.toUpperCase() || null,
  price: form.price,
  stock: form.stock, // primitive int 대응: 항상 전송
  description: form.description,
  imageUrl: filename, // 업로드 없으면 기존 파일명 유지
  season: (form.season || '').toUpperCase() || null,
  keyword: (form.keyword ?? '').trim(),
};

    // 3) 우선 PUT /product/{id} 로 업데이트
    let res;
    try {
      res = await axios.put(
        `${API_BASE_URL}/product/${encodeURIComponent(form.id)}`,
        payload,
        { withCredentials: true }
      );
    } catch (err) {
      // 404 등으로 실패하면 POST /product/{id}/update 로 폴백
      const st = err?.response?.status;
     if (st === 404 || st === 405 || st === 415) {
        res = await axios.post(
          `${API_BASE_URL}/product/${encodeURIComponent(form.id)}/update`,
          payload,
          { withCredentials: true }
        );
      } else {
        throw err;
      }
    }

    const data = res?.data;
    const updated =
      data && (data.id ?? data.productId)
        ? { ...product, ...data, id: data.id ?? data.productId }
        : { ...product, ...payload };

    alert('상품이 수정되었습니다.');
    onSaved?.(updated);
    onClose?.();
  } catch (err) {
    console.error('EDIT FAIL', {
      urlTried: `${API_BASE_URL}/product/${encodeURIComponent(form.id)}`,
      fallbackUrl: `${API_BASE_URL}/product/${encodeURIComponent(form.id)}/update`,
      status: err?.response?.status,
      data: err?.response?.data,
      message: err?.message,
    });
    setError(err?.response?.data || String(err?.message || '상품 수정 중 오류 발생'));
    alert('상품 수정 중 오류가 발생했습니다.');
  } finally {
    setSaving(false);
  }
};

  if (!show) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 10,
          padding: 20,
          width: 'min(780px, 95vw)',
          boxShadow: '0 5px 25px rgba(0,0,0,0.3)',
        }}
      >
        <h3 style={{ marginBottom: 15 }}>상품 수정</h3>

        {/* 상단: 이미지 미리보기 + 파일 선택 */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, marginBottom: 12 }}>
          <div>
            <div style={{
              width: 220, height: 220, border: '1px solid #eee', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', background: '#fafafa'
            }}>
              {preview ? (
                <img
                  src={preview}
                  alt="미리보기"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ color: '#aaa' }}>미리보기 없음</span>
              )}
            </div>
            <label
              style={{
                display: 'inline-block', marginTop: 10, padding: '8px 12px',
                border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer'
              }}
            >
              이미지 선택
              <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
            </label>
            {form.imageUrl && !file && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#777' }}>
                현재 파일: {form.imageUrl}
              </div>
            )}
          </div>

          {/* 우측: 상세 필드 */}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
            <label>
              상품명
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
            카테고리
            <select
        name="category"
        value={asEnumString(form.category)}
        onChange={handleChange}
        required
      >
        <option value="">(선택)</option>
        {CATEGORY_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
</select>
          </label>
            <label>
              가격
              <input type="number" name="price" min="0" value={form.price} onChange={handleChange} />
            </label>
            {/* <label>
              재고
              <input type="number" name="stock" min="0" value={form.stock} onChange={handleChange} />
            </label> */}
            <label>
              설명
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} style={{ resize: 'vertical' }} />
            </label>
            <label>
                키워드
                <input name="keyword" value={form.keyword ?? ''} onChange={handleChange} />
              </label>

              <label>
                계절
                <select name="season" value={form.season ?? ''} onChange={handleChange}>
                  <option value="">(선택)</option>
                  <option value="SPRING">SPRING</option>
                  <option value="SUMMER">SUMMER</option>
                  <option value="FALL">FALL</option>
                  <option value="WINTER">WINTER</option>
                </select>
              </label>
              


            {error && (
              <div style={{ color: 'crimson', fontSize: 14 }}>{String(error)}</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button type="button" onClick={onClose} disabled={saving}>취소</button>
              <button type="submit" disabled={saving}>{saving ? '저장 중...' : '저장'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
