import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
  View,
  TouchableOpacity,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageViewer from 'react-native-image-zoom-viewer';

import { useProduct } from '@/hooks/useProduct';

import { Product } from '@/types/product';

import { ThemedView } from '@/components/ThemedView';
import { Icon } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';
import ProductGallery from '@/components/organisms/ProductGallery';
import ProductInfo from '@/components/organisms/ProductInfo';
import ProductSpecs from '@/components/organisms/ProductSpecs';
import ReviewSection from '@/components/organisms/ReviewSection';
import ProductListSection from '@/components/organisms/ProductListSection';

import { useCart } from '@/hooks/useCart';

import { useWishlist } from '@/store/user';


export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const productId = typeof id === 'string' ? id : null;

  const { top, bottom } = useSafeAreaInsets();

  const { addItem } = useCart();

  const { addToWishlist, removeFromWishlist, isInWishlist, loadWishlist } = useWishlist();

  // INFO: Use abstracted product fetching hook
  const { product, loading } = useProduct(productId);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    {}
  );

  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // INFO: Load wishlist when component mounts
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // INFO: Capture variant selection
  const handleVariantSelect = (variantId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [variantId]: value }));
  };

  // INFO: Validate options then add item to cart
  const handleAddToCart = () => {
    if (product) {
      const allOptionsSelected = product.variants.every(
        (variant) => selectedOptions[variant.id]
      );

      if (!allOptionsSelected) {
        Alert.alert('Please select all options');
        return;
      }

      addItem({
        product,
        quantity: 1,
        selectedVariants: selectedOptions,
      });

      Alert.alert('Added to cart!', `${product.name} has been added to your cart.`);
    }
  };

  // INFO: Open fullscreen image viewer
  const handleImagePress = (index: number) => {
    setCurrentImageIndex(index);
    setIsImageViewerVisible(true);
  };

  // INFO: Toggle wishlist for this product
  const handleWishlistToggle = () => {
    if (product) {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }
    }
  };

  // TODO: Implement size guide press
  const handleSizeGuidePress = () => {
    console.log('Size guide pressed');
  };

  const handleProductPress = (product: Product) => {
    if (product?.id) {
      router.push(`/product/${product.id}`);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <Stack.Screen options={{ title: "Loading...", headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} style= {styles.backButton} />
          </TouchableOpacity>
        ) }} />
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!product) {
    return (
      <ThemedView style={styles.centered}>
        <Stack.Screen options={{ title: "Product", headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} style= {styles.backButton} />
          </TouchableOpacity>
        ) }} />
        <Text>Product not found.</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: product.name, headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} style={ styles.backButton }/>
        </TouchableOpacity>
      ) }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProductGallery
          images={product.images}
          onActiveImageChange={setCurrentImageIndex}
          onImagePress={handleImagePress}
        />
        
        <ProductInfo
          product={product}
          selectedOptions={selectedOptions}
          onVariantSelect={handleVariantSelect}
          onWishlistToggle={handleWishlistToggle}
          isWishlisted={isInWishlist(product.id)}
        />

        <ProductSpecs onSizeGuidePress={handleSizeGuidePress} />

        <ReviewSection
          reviews={product.reviews}
          rating={product.rating}
          onViewAllReviews={() => console.log('View all reviews')}
        />

        <ProductListSection
          title="Most Popular"
          products={relatedProducts}
          onProductPress={handleProductPress}
          onSeeAllPress={() => console.log('See all popular')}
        />

        <ProductListSection
          title="You Might Like"
          products={relatedProducts}
          onProductPress={handleProductPress}
          onSeeAllPress={() => console.log('See all recommendations')}
          showSeeAll={false}
        />
      </ScrollView>
      
      <ThemedView style={[styles.buttonContainer, { paddingBottom: bottom || 16 }]}>
        <View style={styles.actionButtons}>
          <Button
            title="Add to cart"
            onPress={handleAddToCart}
            style={styles.addToCartButton}
          />
          <Button
            title="Buy now"
            onPress={() => console.log('Buy now')}
            style={styles.buyNowButton}
          />
        </View>
      </ThemedView>
      <Modal visible={isImageViewerVisible} transparent={true}>
        <ImageViewer
          imageUrls={product?.images.map(uri => ({ url: uri })) || []}
          index={currentImageIndex}
          onSwipeDown={() => setIsImageViewerVisible(false)}
          onClick={() => setIsImageViewerVisible(false)}
          enableSwipeDown={true}
          enablePreload={true}
          renderIndicator={() => <View />}
          renderFooter={(currentIndex) => {
            const totalImages = product?.images.length || 0;
            return (
              <ThemedView style={styles.imageViewerFooter}>
                <Text style={styles.imageCounter}>
                  {(currentIndex || 0) + 1} / {totalImages}
                </Text>
              </ThemedView>
            );
          }}
        />
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
  },
  imageViewerFooter: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  imageCounter: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
});
