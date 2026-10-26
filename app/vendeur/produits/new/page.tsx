'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSellerDashboard } from '@/components/seller-layout-shell'
import {
  sellerProductsService,
  SellerProductItem,
  CreateProductInput,
} from '@/lib/seller-products-service'
import { SellerProductEditor } from '@/components/seller/seller-product-editor'

function SellerProductNewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { storeDisplayName, storeSlug, showToast } = useSellerDashboard()

  const editId = searchParams.get('edit') || searchParams.get('id')
  const duplicateId = searchParams.get('duplicate')

  const [isLoading, setIsLoading] = useState(Boolean(editId || duplicateId))
  const [initialProduct, setInitialProduct] = useState<SellerProductItem | null>(null)

  useEffect(() => {
    const targetId = editId || duplicateId
    if (!targetId) {
      setIsLoading(false)
      return
    }

    let isMounted = true
    const fetchTargetProduct = async () => {
      try {
        const products = await sellerProductsService.getProducts(storeDisplayName, storeSlug)
        const found = products.find((p) => p.id === targetId)

        if (isMounted) {
          if (found) {
            if (duplicateId) {
              // Pre-fill fields for a fresh clone
              setInitialProduct({
                ...found,
                id: '',
                name: `${found.name} (Copie)`,
                sku: `${found.sku}-CPY`,
                status: 'DRAFT',
              })
            } else {
              setInitialProduct(found)
            }
          } else {
            showToast('Produit introuvable')
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement du produit:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchTargetProduct()

    return () => {
      isMounted = false
    }
  }, [editId, duplicateId, storeDisplayName, storeSlug, showToast])

  const handleSave = async (data: CreateProductInput, isUpdate?: boolean) => {
    try {
      if (isUpdate && initialProduct && editId) {
        await sellerProductsService.updateProduct(storeDisplayName, storeSlug, {
          ...data,
          id: initialProduct.id,
        })
        showToast('Produit mis à jour avec succès.')
      } else {
        await sellerProductsService.createProduct(storeDisplayName, storeSlug, data)
        showToast(
          data.submitForReview
            ? 'Produit soumis avec succès pour validation par l’administrateur !'
            : 'Produit enregistré dans vos brouillons.'
        )
      }
      router.push('/vendeur/produits')
    } catch (err: any) {
      throw new Error(err?.message || 'Erreur lors de l’enregistrement du produit.')
    }
  }

  const handleCancel = () => {
    router.push('/vendeur/produits')
  }

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#006B55]/20 border-t-[#006B55] animate-spin mb-4" />
        <p className="text-sm font-bold text-[#102A2A]">Chargement du produit…</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <SellerProductEditor
        initialProduct={editId ? initialProduct : null}
        storeName={storeDisplayName}
        storeSlug={storeSlug}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}

export default function SellerProductNewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 rounded-full border-3 border-[#006B55]/20 border-t-[#006B55] animate-spin mb-4" />
          <p className="text-sm font-bold text-[#102A2A]">Chargement de la page…</p>
        </div>
      }
    >
      <SellerProductNewContent />
    </Suspense>
  )
}
