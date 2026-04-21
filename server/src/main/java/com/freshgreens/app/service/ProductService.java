package com.freshgreens.app.service;

import com.freshgreens.app.dto.PageResponse;
import com.freshgreens.app.dto.ProductRequest;
import com.freshgreens.app.dto.ProductResponse;
import com.freshgreens.app.model.Category;
import com.freshgreens.app.model.Product;
import com.freshgreens.app.model.User;
import com.freshgreens.app.repository.CategoryRepository;
import com.freshgreens.app.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Cacheable(value = "products", key = "'page:' + #page + ':size:' + #size")
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getActiveProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> result = productRepository
                .findByStatusOrderByCreatedAtDesc(Product.Status.ACTIVE, pageable)
                .map(this::toResponse);
        return toPageResponse(result);
    }

    @Cacheable(value = "products", key = "'cat:' + #categoryId + ':page:' + #page")
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProductsByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> result = productRepository
                .findByCategoryIdAndStatus(categoryId, Product.Status.ACTIVE, pageable)
                .map(this::toResponse);
        return toPageResponse(result);
    }

    @Cacheable(value = "product-detail", key = "#id")
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return toResponse(product);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchProducts(String query, String city, String pincode,
                                                 int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<ProductResponse> result;
        if (query != null && !query.isBlank() && city != null && !city.isBlank()) {
            result = productRepository
                    .searchByQueryAndLocation(query, city, pincode != null ? pincode : "", Product.Status.ACTIVE, pageable)
                    .map(this::toResponse);
        } else if (query != null && !query.isBlank()) {
            result = productRepository
                    .searchByQuery(query, Product.Status.ACTIVE, pageable)
                    .map(this::toResponse);
        } else if (city != null && !city.isBlank()) {
            result = productRepository
                    .findByLocation(city, pincode != null ? pincode : "", Product.Status.ACTIVE, pageable)
                    .map(this::toResponse);
        } else {
            return getActiveProducts(page, size);
        }

        return toPageResponse(result);
    }

    @CacheEvict(value = {"products", "product-detail"}, allEntries = true)
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }

        Product product = Product.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .unit(request.getUnit())
                .stockQuantity(request.getStockQuantity())
                .city(request.getCity())
                .pincode(request.getPincode())
                .category(category)
                .status(Product.Status.ACTIVE)
                .build();

        product = productRepository.save(product);

        return toResponse(product);
    }

    @CacheEvict(value = {"products", "product-detail"}, allEntries = true)
    @Transactional
    public ProductResponse updateProductImage(Long productId, String imageUrl, User requester) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setImageUrl(imageUrl);
        product = productRepository.save(product);
        return toResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ProductResponse toResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .unit(product.getUnit())
                .stockQuantity(product.getStockQuantity())
                .imageUrl(product.getImageUrl())
                .city(product.getCity())
                .pincode(product.getPincode())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .status(product.getStatus().name())
                .createdAt(product.getCreatedAt() != null ? product.getCreatedAt().toString() : null)
                .build();
    }

    private PageResponse<ProductResponse> toPageResponse(Page<ProductResponse> page) {
        return PageResponse.<ProductResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }
}
