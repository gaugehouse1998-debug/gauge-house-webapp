import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Layers,
  Save,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Upload,
  RefreshCw
} from 'lucide-react';
import { Product, ProductVariant, VariantDimension, Category } from '../../types';
import { ProductGalleryUploader } from './ImageUploader';
import { uploadImageFile, validateImageFile } from '../../lib/storageService';

interface AdminProductModalProps {
  product: Product | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void>;
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  product,
  categories,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(product?.title || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [category, setCategory] = useState(product?.category || categories[0]?.name || 'Pressure Gauges');
  const [brand, setBrand] = useState(product?.brand || 'Gauge House');
  const [sku, setSku] = useState(product?.sku || 'GH-');
  const [price, setPrice] = useState<number>(product?.price || 0);
  const [salePrice, setSalePrice] = useState<number>(product?.salePrice || 0);
  const [stock, setStock] = useState<number>(product?.stock ?? 10);
  const [unit, setUnit] = useState(product?.unit || 'Piece');
  const [description, setDescription] = useState(product?.description || '');
  const [published, setPublished] = useState(product?.published ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);

  // Images list
  const [images, setImages] = useState<string[]>(
    product?.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80']
  );
  const [newImageUrl, setNewImageUrl] = useState('');

  // Specifications key-value pairs
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>(() => {
    if (product?.specifications) {
      return Object.entries(product.specifications).map(([key, value]) => ({ key, value }));
    }
    return [
      { key: 'Dial Size', value: '4 inch (100mm)' },
      { key: 'Pressure Range', value: '0–10 bar (0–150 psi)' },
      { key: 'Connection', value: '1/2" NPT Bottom Entry' },
      { key: 'Accuracy', value: '±1.0% F.S. (Class 1)' },
      { key: 'Case Material', value: 'Stainless Steel AISI 304' },
    ];
  });

  // Variant Dimensions (e.g. Dial Size: 2.5", 4", 6" ; Pressure Range: 0-10 bar, 0-16 bar)
  const [variantDimensions, setVariantDimensions] = useState<VariantDimension[]>(
    product?.variantDimensions || []
  );

  // Pre-configured variants list (specialized pricing / SKU per combination)
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants || []);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from title if new product
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!product) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  // Dimension Handlers
  const handleAddDimension = () => {
    setVariantDimensions((prev) => [
      ...prev,
      { name: 'New Dimension', options: ['Option 1', 'Option 2'] },
    ]);
  };

  const handleRemoveDimension = (idx: number) => {
    setVariantDimensions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateDimensionName = (idx: number, name: string) => {
    setVariantDimensions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], name };
      return copy;
    });
  };

  const handleUpdateDimensionOptions = (idx: number, optString: string) => {
    const opts = optString.split(',').map((s) => s.trim()).filter(Boolean);
    setVariantDimensions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], options: opts };
      return copy;
    });
  };

  // Spec Handlers
  const handleAddSpec = () => {
    setSpecs((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateSpec = (idx: number, field: 'key' | 'value', val: string) => {
    setSpecs((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  // Image Handlers
  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Variant Matrix Handlers
  const handleGenerateVariants = () => {
    if (variantDimensions.length === 0) return;

    const dimensionsWithOptions = variantDimensions.filter((d) => d.options && d.options.length > 0);
    if (dimensionsWithOptions.length === 0) return;

    let combinations: Record<string, string>[] = [{}];
    for (const dim of dimensionsWithOptions) {
      const nextCombos: Record<string, string>[] = [];
      for (const combo of combinations) {
        for (const opt of dim.options) {
          nextCombos.push({ ...combo, [dim.name]: opt });
        }
      }
      combinations = nextCombos;
    }

    const generated: ProductVariant[] = combinations.slice(0, 50).map((attrs, idx) => {
      const existing = variants.find((v) =>
        Object.entries(attrs).every(([k, val]) => v.attributes[k] === val)
      );
      if (existing) return existing;

      const comboSlug = Object.values(attrs)
        .map((s) => s.replace(/[^a-zA-Z0-9]/g, ''))
        .join('-');

      const newVar: ProductVariant = {
        id: `var_${Date.now()}_${idx}`,
        attributes: attrs,
        sku: `${sku || 'GH'}-${comboSlug}`.toUpperCase(),
        price: Number(price) || 0,
        stock: Number(stock) || 10,
        enabled: true,
      };
      if (Number(salePrice) > 0) {
        newVar.salePrice = Number(salePrice);
      }
      return newVar;
    });

    setVariants(generated);
  };

  const handleUpdateVariant = (idx: number, field: keyof ProductVariant, val: unknown) => {
    setVariants((prev) => {
      const copy = [...prev];
      const updated = { ...copy[idx] };
      if (val === undefined || val === '' || val === null) {
        delete (updated as Record<string, unknown>)[field];
      } else {
        (updated as Record<string, unknown>)[field] = val;
      }
      copy[idx] = updated as ProductVariant;
      return copy;
    });
  };

  const handleRemoveVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUploadVariantImage = async (variantIdx: number, file: File) => {
    const val = validateImageFile(file);
    if (!val.valid) {
      setError(val.error || 'Invalid file');
      return;
    }
    try {
      const res = await uploadImageFile(file, 'products', product?.id || 'new_prod');
      handleUpdateVariant(variantIdx, 'image', res.url);
    } catch (e: any) {
      setError(e?.message || 'Failed to upload variant image');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a Product Title');
      return;
    }
    if (price < 0) {
      setError('Price cannot be negative');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Convert specs back to object
      const specObj: Record<string, string> = {};
      specs.forEach((s) => {
        if (s.key.trim()) {
          specObj[s.key.trim()] = s.value.trim();
        }
      });

      const filteredDimensions = (variantDimensions || [])
        .filter((d) => d && typeof d === 'object' && d.name && d.name.trim() && Array.isArray(d.options) && d.options.length > 0)
        .map((d) => ({
          name: d.name.trim(),
          options: d.options.map((o) => String(o || '').trim()).filter(Boolean),
        }));
      const filteredVariants = variants.map((v) => {
        const cleanV: ProductVariant = {
          id: v.id,
          attributes: v.attributes,
          sku: v.sku,
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
          enabled: Boolean(v.enabled),
        };
        if (v.salePrice && Number(v.salePrice) > 0) {
          cleanV.salePrice = Number(v.salePrice);
        }
        if (v.image && v.image.trim()) {
          cleanV.image = v.image.trim();
        }
        return cleanV;
      });

      const payload: Partial<Product> = {
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        brand: brand.trim(),
        sku: sku.trim(),
        price: Number(price),
        stock: Number(stock),
        unit: unit.trim(),
        description: description.trim(),
        published,
        featured,
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
        specifications: specObj,
        variantDimensions: filteredDimensions,
        variants: filteredVariants,
      };

      if (Number(salePrice) > 0) {
        payload.salePrice = Number(salePrice);
      }

      await onSave(payload);
      onClose();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err?.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-neutral-200 my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              {product ? 'Edit Industrial Product' : 'Add New Industrial Product'}
            </h2>
            <p className="text-xs text-neutral-500">
              Configure product specifications, multi-variant dimensions, pricing, and media.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Stainless Steel Pressure Gauge 4 Inch Dial"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated-slug"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg font-mono focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Brand Name</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Gauge House, WIKA, Baumer"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Base SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. GH-PG-SS100"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg font-mono focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Regular Price (PKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Sale Price (PKR) <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
                placeholder="0 if none"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Stock Units</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Pricing Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. Piece, Set, Unit"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded border-neutral-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-neutral-800">Published in Customer Catalog</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-neutral-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-neutral-800">Featured on Homepage</span>
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 mb-1">Product Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive technical details, manufacturing standards, warranty, application guide..."
                className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* MULTI-VARIANT DIMENSION BUILDER */}
          {/* ========================================================= */}
          <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-600" />
                  Multi-Variant Dimensions
                </h3>
                <p className="text-[11px] text-neutral-600">
                  Allow customers to order multiple combinations (e.g. Dial Size, Pressure Range, Connection).
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddDimension}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Dimension</span>
              </button>
            </div>

            {variantDimensions.length > 0 ? (
              <div className="space-y-3">
                {variantDimensions.map((dim, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="w-full sm:w-1/3">
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase">Dimension Name</label>
                      <input
                        type="text"
                        value={dim.name}
                        onChange={(e) => handleUpdateDimensionName(idx, e.target.value)}
                        placeholder="e.g. Dial Size"
                        className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded"
                      />
                    </div>
                    <div className="w-full sm:flex-1">
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase">Options (Comma separated)</label>
                      <input
                        type="text"
                        value={dim.options.join(', ')}
                        onChange={(e) => handleUpdateDimensionOptions(idx, e.target.value)}
                        placeholder="e.g. 2.5 inch, 4 inch, 6 inch"
                        className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDimension(idx)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 cursor-pointer self-end sm:self-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 italic">
                No variant dimensions configured. This product will be sold as a single standard unit.
              </p>
            )}

            {/* VARIANT COMBINATIONS & VARIANT IMAGES (REQUIREMENT 21) */}
            {variantDimensions.length > 0 && (
              <div className="pt-4 border-t border-orange-200/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                      Configured Variants & Variant Images ({variants.length})
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Optionally assign an image to a specific variant combination (e.g. Black vs Stainless).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateVariants}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generate Variant Combinations</span>
                  </button>
                </div>

                {variants.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {variants.map((v, vIdx) => {
                      const attrSummary = Object.entries(v.attributes)
                        .map(([k, val]) => `${k}: ${val}`)
                        .join(' | ');

                      return (
                        <div
                          key={v.id || vIdx}
                          className="p-3 bg-white rounded-lg border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex-1">
                            <span className="font-bold text-neutral-900 block">{attrSummary}</span>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500 font-mono">
                              <span>SKU: {v.sku}</span>
                              <span>•</span>
                              <span>PKR {v.price}</span>
                              <span>•</span>
                              <span>Stock: {v.stock}</span>
                            </div>
                          </div>

                          {/* Variant Image Selector / Upload */}
                          <div className="flex items-center gap-2">
                            {v.image ? (
                              <div className="relative w-11 h-11 rounded-lg border border-neutral-300 overflow-hidden shrink-0 group">
                                <img src={v.image} alt="Variant" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateVariant(vIdx, 'image', undefined)}
                                  className="absolute inset-0 bg-red-600/85 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                                  title="Remove variant image"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                {images.length > 0 && (
                                  <select
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        handleUpdateVariant(vIdx, 'image', e.target.value);
                                      }
                                    }}
                                    defaultValue=""
                                    className="px-2 py-1 bg-neutral-50 border border-neutral-300 rounded-lg text-[11px] cursor-pointer"
                                  >
                                    <option value="" disabled>Choose Photo</option>
                                    {images.map((img, i) => (
                                      <option key={i} value={img}>Photo #{i + 1}</option>
                                    ))}
                                  </select>
                                )}

                                <label className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg text-[11px] cursor-pointer flex items-center gap-1 transition-colors">
                                  <Upload className="w-3 h-3" />
                                  <span>Upload</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleUploadVariantImage(vIdx, e.target.files[0]);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(vIdx)}
                              className="p-1.5 text-neutral-400 hover:text-red-600 cursor-pointer"
                              title="Delete Variant Row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-500 italic">
                    Click "Generate Variant Combinations" to create combinations and assign variant-specific images.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* TECHNICAL SPECIFICATIONS EDITOR */}
          {/* ========================================================= */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">
                Technical Specifications Table
              </h3>
              <button
                type="button"
                onClick={handleAddSpec}
                className="px-2.5 py-1 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="space-y-2">
              {specs.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={s.key}
                    onChange={(e) => handleUpdateSpec(idx, 'key', e.target.value)}
                    placeholder="Specification Name (e.g. Connection)"
                    className="w-1/3 px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded"
                  />
                  <input
                    type="text"
                    value={s.value}
                    onChange={(e) => handleUpdateSpec(idx, 'value', e.target.value)}
                    placeholder="Specification Value (e.g. 1/2 inch NPT)"
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* PRODUCT IMAGE GALLERY (REQUIREMENTS 12-20) */}
          {/* ========================================================= */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <ProductGalleryUploader
              images={images}
              onChange={setImages}
              productId={product?.id || slug || 'product'}
              disabled={isSaving}
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProduct}
            disabled={isSaving}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Product</span>
          </button>
        </div>
      </div>
    </div>
  );
};
