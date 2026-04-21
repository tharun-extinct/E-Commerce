package com.freshgreens.app.config;


// DataInitializer.java
import com.freshgreens.app.model.Category;
import com.freshgreens.app.model.Product;
import com.freshgreens.app.repository.CategoryRepository;
import com.freshgreens.app.repository.ProductRepository;
// import com.freshgreens.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Seeds the database with categories and sample products on first startup.
 * Only runs if categories table is empty (idempotent).
 */
@Component
@Profile("!test")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    // private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            log.info("Database already seeded — skipping data initialization.");
            return;
        }

        log.info("Seeding database with initial categories and products...");

        // ── Categories ──────────────────────────────────────────
        Category vegetables = saveCategory("Vegetables", "Fresh farm vegetables", "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300", 1);
        Category fruits     = saveCategory("Fruits",     "Seasonal fresh fruits",  "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300", 2);
        Category leafy      = saveCategory("Leafy Greens", "Organic leafy vegetables", "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300", 3);
        Category herbs       = saveCategory("Herbs & Spices", "Fresh herbs and spices", "https://images.unsplash.com/photo-1509358271058-aef76a09cd6d?w=300", 4);
        Category organic     = saveCategory("Organic",    "Certified organic produce",  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300", 5);
        Category dairy       = saveCategory("Dairy & Eggs", "Farm-fresh dairy products", "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300", 6);

        log.info("Seeded {} categories.", 6);

        // ── Products ────────────────────────────────────────────
        List<Object[]> productData = List.of(
            // title, description, price, unit, stock, category, imageUrl
            // ── Vegetables (8 products) ──────────────────────────────────────────
            new Object[]{"Organic Tomatoes",      "Vine-ripened organic tomatoes, rich in flavor.",          new BigDecimal("45.00"), "kg",    50, vegetables, "https://tse3.mm.bing.net/th/id/OIP.fgIz5Ttij83FDHokBPpb_gHaEK?rs=1&pid=ImgDetMain&o=7&rm=3"},
            new Object[]{"Green Capsicum",        "Crunchy bell peppers, perfect for salads.",                new BigDecimal("60.00"), "kg",    35, vegetables, "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400"},
            new Object[]{"Red Onions",            "Premium Nashik red onions.",                              new BigDecimal("35.00"), "kg",    90, vegetables, "https://minnetonkaorchards.com/wp-content/uploads/2023/08/red-onions.jpeg"},
            new Object[]{"Potatoes",        "Naturally sweet, high-fiber root vegetable.",                   new BigDecimal("55.00"), "kg",    45, vegetables, "https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400"},
            new Object[]{"Beetroot",              "Naturally red, high-fiber root vegetable.",               new BigDecimal("55.00"), "kg",    35, vegetables, "https://c.ndtvimg.com/2025-05/ctk35j1_beetroot-benefits-_650x400_13_May_25.jpg"},
            new Object[]{"Brinjal",              "Naturally purple, high-fiber vegetable.",                  new BigDecimal("40.00"), "kg",    24, vegetables, "https://www.shutterstock.com/image-photo/brinjals-tree-field-natural-sunny-600nw-2621798045.jpg"},
            new Object[]{"Cauliflower",           "Fresh white cauliflower, great for curries.",              new BigDecimal("55.00"), "kg",    28, vegetables, "https://images.unsplash.com/photo-1692956706779-576c151ec712?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"},
            new Object[]{"Bitter Gourd",          "Fresh bitter gourd, known for health benefits.",           new BigDecimal("38.00"), "kg",    40, vegetables, "https://www.incredibleseeds.ca/cdn/shop/products/GourdSeeds-BitterMelon_GreenSkin_720x@2x.jpg?v=1678985672"},
 
            // ── Fruits (8 products) ──────────────────────────────────────────────
            new Object[]{"Alphonso Mangoes",      "Premium Ratnagiri Alphonso mangoes.",                     new BigDecimal("350.00"), "dozen", 25, fruits, "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400"},
            new Object[]{"Bananas",               "Naturally ripened bananas, rich in potassium.",            new BigDecimal("50.00"), "dozen", 70, fruits, "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400"},
            new Object[]{"Red Apples",            "Crisp and sweet Shimla red apples.",                      new BigDecimal("180.00"), "kg",   30, fruits, "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400"},
            new Object[]{"Pomegranate",           "Juicy, ruby-red pomegranate seeds.",                      new BigDecimal("120.00"), "kg",   20, fruits, "https://tse3.mm.bing.net/th/id/OIP.z7DwNsBjkNSig_duAM6XwQHaFF?w=249&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3%22"},
            new Object[]{"Watermelon",            "Sweet and refreshing watermelon, seedless variety.",       new BigDecimal("40.00"),  "kg",   15, fruits, "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=400"},
            new Object[]{"Papaya",                "Ripe golden papaya, rich in digestive enzymes.",           new BigDecimal("60.00"),  "piece",22, fruits, "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=400"},
            new Object[]{"Guava",                 "Sweet green guava, packed with vitamin C.",                new BigDecimal("70.00"),  "kg",   40, fruits, "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=400"},
            new Object[]{"Pineapple",             "Tropical pineapple, naturally sweet and tangy.",           new BigDecimal("80.00"),  "piece",18, fruits, "https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=400"},
 
            // ── Leafy Greens (8 products) ────────────────────────────────────────
            new Object[]{"Fresh Spinach Bunch",   "Tender baby spinach, pesticide-free.",                    new BigDecimal("30.00"), "bunch", 80, leafy, "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400"},
            new Object[]{"Methi (Fenugreek)",     "Fresh fenugreek leaves, slightly bitter and aromatic.",   new BigDecimal("20.00"), "bunch", 60, leafy, "https://th.bing.com/th/id/R.75f33c07c376992a7ed6b57990d9e814?rik=GD5EmQWg8WE2nA&riu=http%3a%2f%2fspecialtyproduce.com%2fsppics%2f11512.png&ehk=s9jQHdM2PPBWlHo6utzyGNnVMmR4SqO%2fgw5vZ%2fbaJjg%3d&risl=&pid=ImgRaw&r=0%22"},
            new Object[]{"Palak (Spinach)",       "Large-leaf spinach bunches, freshly harvested.",          new BigDecimal("25.00"), "bunch", 75, leafy, "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=400"},
            new Object[]{"Amaranth Leaves",       "Nutritious red & green amaranth leaves.",                 new BigDecimal("18.00"), "bunch", 50, leafy, "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400"},
            new Object[]{"Drumstick Leaves",      "Moringa leaves, superfood packed with nutrients.",        new BigDecimal("22.00"), "bunch", 45, leafy, "https://tse4.mm.bing.net/th/id/OIP.-6cCI7o3rkDEtlkyvs38ygHaHa?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3"},
            new Object[]{"Kale",                  "Curly kale leaves, rich in iron and vitamins.",           new BigDecimal("50.00"), "bunch", 30, leafy, "https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=400"},
            new Object[]{"Lettuce",               "Crisp iceberg lettuce, perfect for salads.",              new BigDecimal("40.00"), "piece", 35, leafy, "https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=400"},
            new Object[]{"Cabbage",               "Fresh green cabbage, great for stir-fries and salads.",   new BigDecimal("35.00"), "piece", 55, leafy, "https://tse3.mm.bing.net/th/id/OIP.iknVRi_2c_75bblym4uLTwHaE8?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3"},
 
            // ── Herbs & Spices (8 products) ──────────────────────────────────────
            new Object[]{"Fresh Coriander",       "Aromatic coriander leaves, freshly harvested.",           new BigDecimal("15.00"), "bunch", 100, herbs, "https://cdn.shopify.com/s/files/1/1380/2059/products/Coriander.jpg?v=1480318423"},
            new Object[]{"Fresh Mint Leaves",     "Cool and refreshing mint, great for chutneys.",           new BigDecimal("10.00"), "bunch", 120, herbs, "https://tse1.mm.bing.net/th/id/OIP.ls9gPDr6HaYrA6Oi08m7KwHaHa?w=186&h=186&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3%22"},
            new Object[]{"Curry Leaves",          "Fragrant curry leaves, essential for South Indian cuisine.", new BigDecimal("8.00"), "bunch", 90, herbs, "https://www.bombayspices.ca/wp-content/uploads/2019/03/CURRY-LEAVES.jpg"},
            new Object[]{"Green Chillies",        "Spicy fresh green chillies, perfect for Indian cooking.", new BigDecimal("20.00"), "100g",  80, herbs, "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400"},
            new Object[]{"Ginger",                "Fresh ginger root, great for teas and curries.",          new BigDecimal("60.00"), "kg",    50, herbs, "https://tse3.mm.bing.net/th/id/OIP.NKgkhkC3SI_Gh00jDINDVAHaFs?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3"},
            new Object[]{"Garlic",                "Fresh garlic bulbs, pungent and flavorful.",              new BigDecimal("80.00"), "kg",    45, herbs, "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400"},
            new Object[]{"Lemongrass",            "Fresh lemongrass stalks, aromatic and citrusy.",          new BigDecimal("30.00"), "bunch", 35, herbs, "https://temeculalandscapeconstruction.com/wp-content/uploads/2017/08/AdobeStock_43289868.jpeg"},
            new Object[]{"Basil Leaves",          "Sweet basil, perfect for pasta and chutneys.",            new BigDecimal("25.00"), "bunch", 40, herbs, "https://tse3.mm.bing.net/th/id/OIP.EFqYDlW1gGUcNJ9maXASewHaE8?rs=1&pid=ImgDetMain&o=7&rm=3"},
 
            // ── Organic (8 products) ─────────────────────────────────────────────
            new Object[]{"Organic Carrots",       "Sweet, crunchy organic carrots.",                         new BigDecimal("40.00"), "kg",    60, organic, "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400"},
            new Object[]{"Broccoli",              "Farm-fresh broccoli florets.",                            new BigDecimal("80.00"), "piece", 30, organic, "https://tse3.mm.bing.net/th/id/OIP.u_RrQNh_79v475hlhGqIIAHaE7?rs=1&pid=ImgDetMain&o=7&rm=3"},
            new Object[]{"Organic Cucumber",      "Crisp organic cucumbers, hydrating and fresh.",           new BigDecimal("35.00"), "kg",    55, organic, "https://images.unsplash.com/photo-1568584711271-6c929fb49b60?w=400"},
            new Object[]{"Organic Beetroot",      "Certified organic beetroot, earthy and sweet.",           new BigDecimal("60.00"), "kg",    30, organic, "https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=400"},
            new Object[]{"Organic Banana",        "Organically grown bananas, free from pesticides.",        new BigDecimal("70.00"), "dozen", 25, organic, "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400"},
            new Object[]{"Organic Lemon",         "Tangy organic lemons, rich in vitamin C.",               new BigDecimal("50.00"), "kg",    40, organic, "https://tse2.mm.bing.net/th/id/OIP.owl-f53zJGiaHnLey5lxIwHaEj?rs=1&pid=ImgDetMain&o=7&rm=3"},
            new Object[]{"Organic Pumpkin",       "Sweet organic pumpkin, great for soups and curries.",    new BigDecimal("45.00"), "kg",    20, organic, "https://www.garden.eco/wp-content/uploads/2017/11/green-pumpkin-1.jpg-1-1020x680.jpg"},
            new Object[]{"Organic Ridge Gourd",   "Tender organic ridge gourd, low in calories.",           new BigDecimal("38.00"), "kg",    35, organic, "https://tse1.mm.bing.net/th/id/OIP.ZQ1oyAa327Xv1kkG3DOclQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3"},
 
            // ── Dairy & Eggs (8 products) ────────────────────────────────────────
            new Object[]{"Farm Fresh Eggs",       "Free-range country eggs, pack of 12.",                   new BigDecimal("90.00"),  "dozen", 40, dairy, "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400"},
            new Object[]{"Fresh Cow Milk",        "Pure cow milk, directly from the farm, 1 litre.",        new BigDecimal("60.00"),  "litre", 50, dairy, "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400"},
            new Object[]{"Paneer",                "Soft fresh paneer made from full-fat cow milk.",         new BigDecimal("120.00"), "200g",  30, dairy, "https://myfoodstory.com/wp-content/uploads/2016/10/How-to-make-Paneer-3.jpg"},
            new Object[]{"Desi Ghee",             "Pure golden desi ghee, traditionally churned.",          new BigDecimal("450.00"), "500ml", 15, dairy, "https://tse2.mm.bing.net/th/id/OIP.p8cGdHn9QXO0yMAEnRYKAQHaE8?w=263&h=180&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3%22"},
            new Object[]{"Natural Yogurt (Curd)", "Thick and creamy homestyle curd.",                       new BigDecimal("50.00"),  "500g",  35, dairy, "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400"},
            new Object[]{"Butter",                "Unsalted white butter, made from fresh cream.",          new BigDecimal("80.00"),  "100g",  25, dairy, "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400"},
            new Object[]{"Buttermilk (Chaas)",    "Light and refreshing salted buttermilk.",                new BigDecimal("30.00"),  "500ml", 45, dairy, "https://tse2.mm.bing.net/th/id/OIP.1z-NZt8iBEj8n1-4T7Hd6AHaEK?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3"},
            new Object[]{"Cheese Slices",         "Mild processed cheese slices, great for sandwiches.",   new BigDecimal("100.00"), "200g",  20, dairy, "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400"}
        );

        int count = 0;
        for (Object[] pd : productData) {
            Product p = new Product();
            p.setTitle((String) pd[0]);
            p.setDescription((String) pd[1]);
            p.setPrice((BigDecimal) pd[2]);
            p.setUnit((String) pd[3]);
            p.setStockQuantity((int) pd[4]);
            p.setCategory((Category) pd[5]);
            p.setImageUrl((String) pd[6]);
            
            p.setCity("Chennai");
            p.setPincode("600001");
            p.setStatus(Product.Status.ACTIVE);
            productRepository.save(p);
            count++;
        }

        log.info("Seeded {} sample products. Data initialization complete.", count);
    }

    private Category saveCategory(String name, String desc, String imageUrl, int order) {
        Category c = new Category();
        c.setName(name);
        c.setDescription(desc);
        c.setImageUrl(imageUrl);
        c.setDisplayOrder(order);
        c.setActive(true);
        return categoryRepository.save(c);
    }
}
