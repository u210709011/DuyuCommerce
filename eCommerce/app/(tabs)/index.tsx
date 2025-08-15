import React, { useLayoutEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router, useNavigation } from "expo-router";

import { ThemedView } from "@/components/ThemedView";
import PromoBanner from "@/components/molecules/PromoBanner";
import SearchBar from "@/components/molecules/SearchBar";
import FlashSaleSection from "@/components/organisms/FlashSaleSection";
import CategoriesSection from "@/components/organisms/CategoriesSection";
import ProductListSection from "@/components/organisms/ProductListSection";

import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useFlashSale } from "@/hooks/useFlashSale";
import { useRefreshableData } from "@/hooks/useRefreshableData";

import { getMockPromoBanners } from "@/services/mockData"; // TODO: Remove mock data

import { Product } from "@/types/product";

import { Colors } from "@/constants/Colors";


export default function HomeScreen() {
  const navigation = useNavigation();
  
  // INFO: Use abstracted hooks for data fetching
  const { products, loading: productsLoading, refresh: refreshProducts } = useProducts({
    initialFilters: { sortBy: 'newest' }
  });
  
  const { categories, loading: categoriesLoading, refresh: refreshCategories } = useCategories();
  
  const { 
    flashSaleProducts, 
    flashSaleTitle, 
    flashSaleEndTime, 
    loading: flashSaleLoading, 
    refresh: refreshFlashSale 
  } = useFlashSale();
  
  // INFO: Coordinate refresh state across all data sources
  const { refreshing, onRefresh } = useRefreshableData(
    { refresh: refreshProducts },
    { refresh: refreshCategories },
    { refresh: refreshFlashSale }
  );
  
  // INFO: Determine overall loading state
  const loading = productsLoading && categoriesLoading && flashSaleLoading;


  // INFO: Configure header with embedded search
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Shop",
      headerShadowVisible: false,
      headerRight: () => (
        <ThemedView style={styles.headerRight}>
          <SearchBar
            placeholder="Search"
            editable={false}
            onPress={() => router.push("/search")}
            inHeader={true}
          />
        </ThemedView>
      ),
    });
  }, [navigation]);

  const promoBanners = getMockPromoBanners();

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleCategoryPress = (category: any) => {
    router.push(`/category/${category.slug}`);
  };

  const handleSeeAllPress = (section: string) => {
    console.log(`Navigate to see all ${section}`);
    // TODO: Actual navigation to see all
  };

  // INFO: Render promo banner item for carousel
  const renderPromoBanner = ({ item }: { item: any }) => (
    <PromoBanner
      title={item.title}
      subtitle={item.subtitle}
      discount={item.discount}
      imageUrl={item.imageUrl}
      backgroundColor={item.backgroundColor}
      onPress={() => console.log("Promo banner pressed:", item.title)} // TODO: Implement promo banner press
    />
  );

  // INFO: Fullscreen loader while bootstrapping
  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.tabIconSelected} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToAlignment="center"
          decelerationRate="fast"
          contentContainerStyle={styles.bannerContainer}
        >
          {promoBanners.map((item) => (
            <ThemedView key={item.id} style= {styles.promoBanner}>
              {renderPromoBanner({ item })}
            </ThemedView>
          ))}

        </ScrollView>

        <CategoriesSection
          categories={categories}
          onCategoryPress={handleCategoryPress}
        />

        <ProductListSection
          title="New Items"
          products={products.slice(0, 6)}
          onProductPress={handleProductPress}
          onSeeAllPress={() => handleSeeAllPress("new-items")}
        />

        <FlashSaleSection
          title={flashSaleTitle}
          endTimeIso={flashSaleEndTime}
          products={flashSaleProducts}
          onProductPress={handleProductPress}
          onSeeAllPress={() => handleSeeAllPress("flash-sale")}
        />

        <ProductListSection
          title="Most Popular"
          products={products.slice(6, 12)}
          onProductPress={handleProductPress}
          onSeeAllPress={() => handleSeeAllPress("popular")}
        />

        <ProductListSection
          title="Just For You"
          products={products.slice(12, 18)}
          onProductPress={handleProductPress}
          onSeeAllPress={() => handleSeeAllPress("recommended")}
        />

        <ProductListSection
          title="Trending Now"
          products={products.slice(18, 24)}
          onProductPress={handleProductPress}
          onSeeAllPress={() => handleSeeAllPress("trending")}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  bannerContainer: {
    paddingTop: 10,
    paddingHorizontal: 16
  },
  promoBanner: {
  },
  headerRight: {
    paddingRight: 25,
    flex: 1,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
  },
});
