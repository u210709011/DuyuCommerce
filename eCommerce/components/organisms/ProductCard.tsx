import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { Product } from '@/types/product';

import { Text } from '../atoms/Text';
import { Image } from '../atoms/Image';
import { ThemedView } from '../ThemedView'; // EXCEPTION: This is an exception, organisms shouldn't import other organisms

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <Image source={{ uri: product.images[0] }} style={styles.image} />
      <ThemedView style={styles.infoContainer}>
        <Text type="defaultSemiBold" style={styles.name}>
          {product.name}
        </Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 150,
  },
  infoContainer: {
    padding: 8,
  },
  name: {
    fontSize: 16,
  },
  price: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
});

export default ProductCard;
