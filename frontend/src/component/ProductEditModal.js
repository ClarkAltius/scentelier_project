import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';
import styles from './ProductManagement.module.css'; // Import styles
import { X, UploadCloud } from 'lucide-react'; // Import icons

export default function ProductEditModal({ show, product, onClose, onSaved }) {

  // --- Helper Functions ---
  const asEnumString = (c) => {
    if (c == null) return '';
    let str = (typeof c === 'object') ? (c.value || c.name || '') : String(c);
    return str.toUpperCase();
  };

  const asSeasonString = (s) => {
    if (s == null || s === '') return '';
    if (typeof s === 'string') return s.toUpperCase();
    const map = { 0: 'SPRING', 1: 'SUMMER', 2: 'FALL', 3: 'WINTER' };
    return map[s] || '';
  };

  // --- State ---
  const [form, setForm] = useState(() => ({
    id: product.id,
    name: product.name ?? '',
    category: asEnumString(product.category) ?? '',
    price: Number(product.price ?? 0),
    stock: Number(product.stock ?? 0),
    description: product.description ?? '',
    imageUrl: product.imageUrl ?? '',
    season: asSeasonString(product.season) ?? '',
    keyword: product.keyword ?? '',
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(() =>
    product.imageUrl ? `${API_BASE_URL}/uploads/products/${product.imageUrl}` : ''
  );

  // --- Reset form when product changes ---
  useEffect(() => {
    setForm({
      id: product.id,
      name: product.name ?? '',
      category: asEnumString(product.category) ?? '',
      price: Number(product.price ?? 0),
      stock: Number(product.stock ?? 0),
      description: product.description ?? '',
      imageUrl: product.imageUrl ?? '',
      season: asSeasonString(product.season) ?? '',
      keyword: product.keyword ?? '',
    });
    setFile(null);
    setPreview(product.imageUrl ? `${API_BASE_URL}/uploads/products/${product.imageUrl}` : '');
    setError(null);
    setSaving(false);
  }, [product]);

  // --- Data Options ---
  const CATEGORY_OPTIONS = [
    { value: 'CITRUS', label: '시트러스' },
    { value: 'FLORAL', label: '플로럴' },
    { value: 'WOODY', label: '우디' },
    { value: 'CHYPRE', label: '시프레' },
    { value: 'GREEN', label: '그린' },
    { value: 'FRUITY', label: '프루티' },
    { value: 'POWDERY', label: '파우더리' },
    { value: 'CRYSTAL', label: '크리스탈' },
  ];

  const SEASON_OPTIONS = [
    { value: 'SPRING', label: '봄' },
    { value: 'SUMMER', label: '여름' },
    { value: 'FALL', label: '가을' },
    { value: 'WINTER', label: '겨울' },
  ];

  // --- Handlers ---
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let filename = form.imageUrl;

      // 1) Upload new file if present
      if (file) {
        const fd = new FormData();
        fd.append('image', file);
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

      // 2) Prepare payload
      const payload = {
        name: form.name,
        category: asEnumString(form.category)?.toUpperCase() || null,
        price: form.price,
        stock: form.stock,
        description: form.description,
        imageUrl: filename,
        season: (form.season || '').toUpperCase() || null,
        keyword: (form.keyword ?? '').trim(),
      };

      // 3) Submit PUT request with POST fallback
      let res;
      try {
        res = await axios.put(
          `${API_BASE_URL}/product/${encodeURIComponent(form.id)}`,
          payload,
          { withCredentials: true }
        );
      } catch (err) {
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

      // 4) Handle success
      const data = res?.data;
      const updated =
        data && (data.id ?? data.productId)
          ? { ...product, ...data, id: data.id ?? data.productId }
          : { ...product, ...payload };

      alert('상품이 수정되었습니다.');
      onSaved?.(updated);
      onClose?.();
    } catch (err) {
      // 5) Handle error
      console.error('EDIT FAIL', err);
      const errMsg = err?.response?.data?.message || err?.response?.data || String(err?.message || '상품 수정 중 오류 발생');
      setError(errMsg);
      // alert('상품 수정 중 오류가 발생했습니다.'); // setError is more professional
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

        {/* === Modal Header === */}
        <div className={styles.modalHeader}>
          <h3>상품 수정</h3>
          <button className={styles.modalCloseButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* === Modal Body === */}
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGrid}>
            {/* --- Left Column: Image --- */}
            <div className={styles.formGroup}>
              <label>상품 이미지</label>
              <div className={styles.imagePreviewContainer}>
                {preview ? (
                  <img src={preview} alt="미리보기" />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <UploadCloud size={48} />
                    <span>이미지 없음</span>
                  </div>
                )}
              </div>
              <label className={styles.imageUploadButton}>
                이미지 선택
                <input type="file" accept="image/*" onChange={handleFile} />
              </label>
              {form.imageUrl && !file && (
                <div className={styles.imageCurrentFile}>
                  현재 파일: {form.imageUrl}
                </div>
              )}
            </div>

            {/* --- Right Column: Details --- */}
            <div className={styles.formFields}>
              <div className={styles.formGroup}>
                <label htmlFor="name">상품명</label>
                <input
                  id="name"
                  name="name"
                  className={styles.formInput}
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="category">카테고리</label>
                  <select
                    id="category"
                    name="category"
                    className={styles.formSelect}
                    value={asEnumString(form.category)}
                    onChange={handleChange}
                    required
                  >
                    <option value="">카테고리 선택</option>
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="season">계절</label>
                  <select
                    id="season"
                    name="season"
                    className={styles.formSelect}
                    value={form.season ?? ''}
                    onChange={handleChange}
                  >
                    <option value="">(선택)</option>
                    {SEASON_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="price">가격</label>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    className={styles.formInput}
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="stock">재고</label>
                  <input
                    id="stock"
                    type="number"
                    name="stock"
                    className={styles.formInput}
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="keyword">키워드</label>
                <input
                  id="keyword"
                  name="keyword"
                  className={styles.formInput}
                  value={form.keyword ?? ''}
                  onChange={handleChange}
                  placeholder="쉼표(,)로 구분하여 입력"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">설명</label>
                <textarea
                  id="description"
                  name="description"
                  className={styles.formTextarea}
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                />
              </div>
            </div>
          </div>

          {/* === Modal Footer === */}
          <div className={styles.modalFooter}>
            {error && (
              <div className={styles.modalError}>
                <strong>오류:</strong> {String(error)}
              </div>
            )}
            <button
              type="button"
              className={styles.buttonSecondary} // New class
              onClick={onClose}
              disabled={saving}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.buttonPrimary} // New class
              disabled={saving}
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}