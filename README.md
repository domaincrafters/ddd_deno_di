# domaincrafters DI 🚀

![License](https://img.shields.io/badge/license-MIT-blue.svg)

![workflow](https://github.com/domaincrafters/ddd_deno_di/actions/workflows/ci.yml/badge.svg)
![GitHub Release](https://img.shields.io/github/v/release/domaincrafters/ddd_deno_di)
[![JSR](https://jsr.io/badges/@domaincrafters/di)](https://jsr.io/@domaincrafters/di)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=domaincrafters.deno.di&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=domaincrafters.deno.di)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=domaincrafters.deno.di&metric=coverage)](https://sonarcloud.io/summary/new_code?id=domaincrafters.deno.di)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=domaincrafters.deno.di&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=domaincrafters.deno.di)

Domaincrafters/DI is a package designed to simplify **dependency injection** for **educational** Domain-Driven Design (DDD) projects in Deno using TypeScript. It provides essential constructs that, while not directly tied to DDD, offer a robust dependency injection toolkit to help you build your DDD projects. 🛠️

## Changelog

See the [CHANGELOG](CHANGELOG.md) for detailed information about changes in each version.

## Concepts ✨

Domaincrafters DI revolves around several core concepts that form the backbone of its dependency injection system. Understanding these concepts is key to effectively utilizing this toolkit in your DDD projects.

### ServiceProvider

The **ServiceProvider** interface defines the contract for a dependency injection (DI) container responsible for resolving services at runtime. It provides methods to:

- **createScope()**: Create a new scoped service provider.
- **getService<Type>(key: string)**: Retrieve a service instance by its key.
- **dispose()**: Dispose of the service provider and release all resources.

The `ServiceProvider` manages the lifetimes of services and ensures that dependencies are resolved according to their configurations.

### ServiceCollection

The **ServiceCollection** interface is used to register and configure services before they are instantiated. It allows you to:

- **addSingleton<Type>(key, factory, disposer?)**: Register a singleton service of a specific type.
- **addScoped<Type>(key, factory, disposer?)**: Register a scoped service of specific type.
- **addTransient(key, factory, disposer?)**: Register a transient service.
- **find(key)**: Find a registered service binding by its key.

The `ServiceCollection` is the foundation for building a `ServiceProvider`, defining how and when services are created and disposed.

### DIServiceProvider

The **DIServiceProvider** is the default implementation of the `ServiceProvider` interface provided by Domaincrafters DI. It resolves services based on the registrations in the `ServiceCollection` and manages service lifetimes and scopes.

**Key Features:**

- Resolves services registered in the `ServiceCollection`.
- Manages **Singleton**, **Scoped**, and **Transient** lifetimes.
- Handles disposal of services when the provider or scope is disposed.

**Example Usage:**

```typescript
const serviceProvider = DIServiceProvider.create(serviceCollection);
const configServiceOptional = await serviceProvider.getService<ConfigService>('configService');
if (configServiceOptional.isPresent) {
  const configService = configServiceOptional.value;
  // Use the configService
}
```

### DIServiceCollection

The **DIServiceCollection** is the default implementation of the `ServiceCollection` interface. It provides methods to register services with different lifetimes and manage their bindings.

**Key Features:**

- Supports method chaining for fluent configuration.
- Stores service bindings categorized by their lifetimes.
- Provides access to scoped, singleton, and transient service bindings.

**Example Usage:**

```typescript
const serviceCollection = DIServiceCollection.create();

serviceCollection
  .addSingleton('configService', async (provider) => new ConfigService())
  .addScoped('userService', async (provider) => new UserService())
  .addTransient('loggingService', async (provider) => new LoggingService());
```

### ServiceLifetime

The **ServiceLifetime** enum defines the possible lifetimes of a service:

- **Singleton**: A single instance is created and shared across the entire application lifetime.
- **Scoped**: A new instance is created per scope. Useful for per-request or per-operation services.
- **Transient**: A new instance is created every time the service is requested.

### ServiceFactory and ServiceDisposer

- **ServiceFactory**: A function that creates an instance of a service. It receives the `ServiceProvider` as a parameter, allowing it to resolve dependencies needed to construct the service.

  **Example:**

  ```typescript
  const userServiceFactory: ServiceFactory = async (provider) => {
    const configService = await provider.getService<ConfigService>('configService');
    return new UserService(configService.value);
  };
  ```

- **ServiceDisposer**: An optional function that disposes of a service instance. It is called when the service provider or scope is disposed.

  **Example:**

  ```typescript
  const userServiceDisposer: ServiceDisposer = async (instance, provider) => {
    await instance.cleanup();
  };
  ```

### EmptyDIServiceProvider and EmptyDIServiceCollection

- **EmptyDIServiceProvider**: An implementation of `ServiceProvider` that does not resolve any services. It serves as a placeholder or default provider, particularly in scenarios where a provider is required but no services have been registered.

- **EmptyDIServiceCollection**: An implementation of `ServiceCollection` that does not allow any services to be registered. Attempts to add services to this collection will result in an error. It is used internally to represent an empty collection.

### How These Concepts Work Together

1. **Register Services**: Use `DIServiceCollection` to register your services with their respective lifetimes and factories.

2. **Build Provider**: Create a `DIServiceProvider` using the configured `ServiceCollection`.

3. **Resolve Services**: Use the `ServiceProvider` to resolve services as needed in your application.

4. **Manage Scopes**: Create scopes using `createScope()` for scoped services, ensuring proper instance management per operation or request.

5. **Dispose Resources**: Call `dispose()` on your `ServiceProvider` or scope to clean up resources and invoke any `ServiceDisposer` functions.

---

## Installation 📦

To install the `@domaincrafters/di` package from domaincrafters using JSR, use the following import statement in your TypeScript project:

```typescript
import { 
  ServiceProvider, 
  ServiceCollection, 
  DIServiceProvider, 
  DIServiceCollection 
} from "@domaincrafters/di";
```

## Contributing 🤝

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/YourFeature`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/YourFeature`.
5. Open a pull request.

Please ensure your code adheres to the project's coding standards and includes relevant tests. 🧪

## Semantic Versioning with Conventional Commits 🔄

This project follows semantic versioning. To simplify the release process, we use conventional commits. Please ensure your commit messages follow the [conventional commit format](https://www.conventionalcommits.org/en/v1.0.0/).

## License 📝

This project is licensed under the [MIT License](LICENSE).

Happy coding with Domaincrafters DI toolkit! 🚀✨