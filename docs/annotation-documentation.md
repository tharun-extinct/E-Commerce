# Fresh Greens — Annotation & Import Documentation

This document explains:

1. **How data/config flows through the codebase (by layer)**
2. **What the common annotations/imports do**
3. **Which Maven dependency provides each annotation** (grouped by `<groupId>:<artifactId>`)

---

## 1) Mental model: layers & data flow

### Layers used in this project

| Layer | Package(s) | Responsibility | Typical input → output |
|---|---|---|---|
| **Web / Controller** | `com.freshgreens.app.controller` | HTTP routing, request binding, validation trigger, status codes | JSON/params → DTO/Entity → `ApiResponse<?>` |
| **Service** | `com.freshgreens.app.service` | Business rules + orchestration, transactions, integration calls | DTO/Entity → domain operations → DTO |
| **Repository (DAO)** | `com.freshgreens.app.repository` | Database access (Spring Data JPA) | method call → SQL/JPQL → Entity |
| **Model (Entity)** | `com.freshgreens.app.model` | JPA entity mapping (tables/relationships/indexes) | Java fields ↔ DB columns |
| **DTO (API contract)** | `com.freshgreens.app.dto` | Request/response payload shapes and validation constraints | request JSON ↔ response JSON |
| **Config / Cross-cutting** | `com.freshgreens.app.config` | Beans, security filters, caching, external SDK initialization | properties/env → runtime wiring |

### Example: Login flow (Firebase → DB → Session)

**Request**: `POST /api/auth/login`

```text
Client (browser)
  │
  │ 1) POST /api/auth/login { idToken }
  ▼
Controller: AuthController
  │ 2) Spring binds JSON → AuthRequest (@RequestBody)
  │ 3) Spring validates AuthRequest (@Valid + @NotBlank)
  ▼
Service: AuthService
  │ 4) Verifies token using Firebase Admin SDK
  │ 5) Upserts user in MySQL via UserRepository (@Transactional)
  ▼
Repository: UserRepository → JPA → MySQL
  │
  ▼
Controller: AuthController
  │ 6) Creates Spring Security Authentication for that User
  │ 7) Saves SecurityContext in HTTP session (JSESSIONID)
  ▼
Response: 200 ApiResponse<AuthResponse> + cookie
```

### Example: Authenticated request flow (session)

Once logged in, the browser sends the `JSESSIONID` cookie automatically.

```text
Client → Controller (e.g., CartController)
  └─ Spring Security restores SecurityContext from session
        └─ @AuthenticationPrincipal injects the principal (User)
```

---

## 2) How annotations work “without imports”

In Java, annotations **must be imported** (or be in the same package) to compile.

This project sometimes uses a wildcard import like:

```java
import org.springframework.web.bind.annotation.*;
```

That single line imports annotations such as `@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping`, `@RequestBody`, etc.

---

## 3) Annotation catalog (grouped by Maven dependency)

> Notes
> - Many annotations come from **transitive dependencies** pulled in by Spring Boot starters.
> - Grouping below is by the dependency in `app/pom.xml` that *brings the annotation into the build*.

### 3.1 `org.springframework.boot:spring-boot-starter-webmvc`

**What it enables:** Spring MVC request routing + argument binding + JSON serialization (via Jackson).

| Annotation | Typical layer | What it does |
|---|---|---|
| `@RestController` | Controller | Registers a controller bean; return values are written to HTTP response body (usually JSON). |
| `@RequestMapping` | Controller | Base path (and optionally method/headers) mapping for a controller/class or method. |
| `@GetMapping` / `@PostMapping` / `@PutMapping` / `@DeleteMapping` | Controller | HTTP method + path mapping shortcuts. |
| `@RequestBody` | Controller | Reads request body (JSON) into an object (DTO) using message converters. |
| `@RequestParam` | Controller | Reads query parameters (e.g., `?page=0&size=10`). |
| `@PathVariable` | Controller | Reads `{id}` parts of URL paths. |
| `@RequestHeader` | Controller | Reads headers (e.g., webhook signature headers). |

**Common usage in this repo:** controllers under `com.freshgreens.app.controller`.

---

### 3.2 `org.springframework.boot:spring-boot-starter-validation`

**What it enables:** Jakarta Bean Validation integration.

| Annotation | Typical layer | What it does |
|---|---|---|
| `@Valid` | Controller | Triggers validation of a request object (DTO). |
| `@NotBlank` / `@NotNull` / `@Min` / `@Size` / `@Email` (etc.) | DTO | Field-level constraints enforced when validated. |

**How it works here:** Controllers annotate parameters with `@Valid`, and DTO fields have constraints.

---

### 3.3 `org.springframework.boot:spring-boot-starter-security`

**What it enables:** Spring Security filter chain + authentication/authorization.

| Annotation | Typical layer | What it does |
|---|---|---|
| `@EnableWebSecurity` | Config | Enables Spring Security web integration. |
| `@EnableMethodSecurity` | Config | Enables method-level security annotations. |
| `@PreAuthorize` | Controller/Service | Evaluates a SpEL expression before calling the method (e.g., role checks). |
| `@AuthenticationPrincipal` | Controller | Injects the current authenticated principal into controller method parameters. |

---

### 3.4 `org.springframework.boot:spring-boot-starter-data-jpa`

**What it enables:** Spring Data JPA repositories + JPA entity management.

#### Spring Data / repository-side annotations

| Annotation | Typical layer | What it does |
|---|---|---|
| `@Repository` | Repository | Marks repository component; enables exception translation. |
| `@Query` | Repository | Declares a JPQL query for a repository method. |
| `@Param` | Repository | Binds method arguments to named parameters in `@Query`. |
| `@Modifying` | Repository | Marks `@Query` method as update/delete (not a select). |

#### Transaction annotations (used heavily with JPA)

| Annotation | Typical layer | What it does |
|---|---|---|
| `@Transactional` | Service/Repository | Runs method inside a transaction; ensures atomicity and helps lazy-loading. |

#### JPA entity mapping annotations (via Jakarta Persistence API)

| Annotation | Typical layer | What it does |
|---|---|---|
| `@Entity` | Model | Marks class as a persistent entity. |
| `@Table` | Model | Table name + indexes definition. |
| `@Id` / `@GeneratedValue` | Model | Primary key definition and generation strategy. |
| `@Column` | Model | Column mapping/constraints (nullable, length, precision). |
| `@Enumerated(EnumType.STRING)` | Model | Stores enum as a string. |
| `@OneToMany` / `@ManyToOne` / `@OneToOne` | Model | Entity relationships. |
| `@JoinColumn` | Model | Defines the FK column used for the relationship. |
| `@Index` | Model | Declares an index in `@Table(indexes=...)`. |

#### Hibernate extras (transitive with JPA starter)

| Annotation | Typical layer | What it does |
|---|---|---|
| `@CreationTimestamp` | Model | Auto-fills create timestamp. |
| `@UpdateTimestamp` | Model | Auto-fills update timestamp. |

---

### 3.5 `org.springframework.boot:spring-boot-starter-data-redis` + `org.springframework.session:spring-session-data-redis`

**What it enables:** caching + Redis integration; session persistence in Redis.

| Annotation | Typical layer | What it does |
|---|---|---|
| `@EnableCaching` | Config | Enables Spring caching abstraction. |
| `@Cacheable` | Controller/Service | Caches method result using cache key derived from args. |
| `@CacheEvict` | Service | Removes entries from cache on update operations. |

**Session note:** session storage is not an annotation, but `spring-session-data-redis` changes *where* sessions live (Redis instead of in-memory), enabling horizontal scalability.

---

### 3.6 `org.springdoc:springdoc-openapi-starter-webmvc-ui`

**What it enables:** OpenAPI / Swagger UI generation.

| Annotation | Typical layer | What it does |
|---|---|---|
| `@Tag` | Controller | Groups endpoints in Swagger UI. |
| `@Operation` | Controller | Describes an endpoint (summary/description). |
| `@ApiResponses` / `@ApiResponse` | Controller | Documents possible responses. |
| `@Schema` / `@Content` | Controller/DTO | Documents schema / response body content. |
| `@SecurityScheme` | Config | Describes security scheme (cookie, bearer, etc.) for docs. |

---

### 3.7 `org.projectlombok:lombok`

**What it enables:** compile-time generation of boilerplate code.

| Annotation | Typical layer | What it does |
|---|---|---|
| `@Getter` / `@Setter` | DTO/Model | Generates getters/setters. |
| `@NoArgsConstructor` / `@AllArgsConstructor` | DTO/Model | Generates constructors. |
| `@Builder` | DTO/Model | Generates builder API. |
| `@Builder.Default` | DTO/Model | Keeps field default when using builder. |
| `@RequiredArgsConstructor` | Config/Components | Generates constructor for `final` fields. |
| `@Slf4j` | Any | Generates an `org.slf4j.Logger` named `log`. |

---

### 3.8 Spring Boot / Spring Framework core (pulled via starters)

These appear in `config/` and sometimes `controller/`.

| Annotation | Typical layer | What it does |
|---|---|---|
| `@Configuration` | Config | Declares a configuration class (bean definitions). |
| `@Bean` | Config | Declares a bean-producing method. |
| `@Component` | Config/Infra | Registers a class as a Spring-managed bean. |
| `@Value` | Config/Controller | Injects a property value (supports defaults like `${x:}`) |
| `@ConditionalOnProperty` | Config | Activates config only if a property has a given value. |

---

### 3.9 Jakarta lifecycle (pulled transitively)

| Annotation | Typical layer | What it does |
|---|---|---|
| `@PostConstruct` | Config | Runs after bean creation; used for one-time initialization (e.g., Firebase). |

---

## 4) Quick reference by project module

### `controller/`
- Use annotations to **expose endpoints** and **bind request data**:
  - Routing: `@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping`, ...
  - Binding: `@RequestBody`, `@RequestParam`, `@PathVariable`, `@RequestHeader`
  - Validation trigger: `@Valid`
  - Security: `@AuthenticationPrincipal`, `@PreAuthorize`
  - Docs: `@Operation`, `@Tag`, `@ApiResponses`

### `dto/`
- Use annotations to **validate inputs** and reduce boilerplate:
  - Validation constraints: `@NotBlank`, `@NotNull`, `@Min`, `@Email`, `@Size`, ...
  - Lombok: `@Getter`, `@Setter`, `@Builder`, constructors

### `service/`
- Use annotations to **define services** and **control transactions/caching**:
  - `@Service`
  - `@Transactional`
  - `@Cacheable`, `@CacheEvict` (where applicable)

### `repository/`
- Use annotations to **declare persistence operations**:
  - `@Repository`
  - `@Query`, `@Param`, `@Modifying`
  - `@Transactional` (usually for modifying queries)

### `model/`
- Use annotations to **map Java objects to DB tables**:
  - `@Entity`, `@Table`, `@Id`, `@Column`, relationships
  - `@CreationTimestamp`, `@UpdateTimestamp`
  - Lombok annotations for boilerplate

### `config/`
- Use annotations to **wire the application**:
  - `@Configuration`, `@Bean`, `@Component`
  - `@Value` for property/env injection
  - Security: `@EnableWebSecurity`, `@EnableMethodSecurity`
  - Caching: `@EnableCaching`, `@ConditionalOnProperty`
  - Swagger: `@SecurityScheme`
  - Initialization: `@PostConstruct`

---

## 5) Common pitfalls (practical)

- **Wildcard imports can hide where annotations come from**
  - Example: `import org.springframework.web.bind.annotation.*;` makes it look like there are “no imports”.

- **Validation constraints do nothing unless triggered**
  - Constraints like `@NotBlank` run only when a controller/service triggers validation (commonly `@Valid`).

- **Lazy-loading needs a transaction**
  - Accessing lazy relationships outside `@Transactional` can cause `LazyInitializationException`.

- **Caching must be enabled**
  - `@Cacheable` requires `@EnableCaching` and a cache manager.

- **Security annotations require method security enabled**
  - `@PreAuthorize` needs `@EnableMethodSecurity`.

---

## 6) Where to look in this repo

- Controllers: `app/src/main/java/com/freshgreens/app/controller/`
- Services: `app/src/main/java/com/freshgreens/app/service/`
- Repositories: `app/src/main/java/com/freshgreens/app/repository/`
- Models: `app/src/main/java/com/freshgreens/app/model/`
- DTOs: `app/src/main/java/com/freshgreens/app/dto/`
- Config: `app/src/main/java/com/freshgreens/app/config/`

---

If you want, I can generate an additional appendix section listing **each file** and the annotations it uses (file-by-file index).