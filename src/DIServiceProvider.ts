/*
 * Copyright (c) 2024 Matthias Blomme and Dimitri Casier
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { IllegalStateException, Optional } from '@domaincrafters/std';
import {
    EmptyDIServiceCollection,
    EmptyDIServiceProvider,
    type Instance,
    type ServiceBinding,
    type ServiceCollection,
    ServiceLifetime,
    type ServiceProvider,
} from '@domaincrafters/di/mod.ts';

/**
 * Represents a service provider that can resolve services based on the registered service collection.
 *
 * @example Usage
 * ```typescript
 * const serviceCollection = DIServiceCollection.create();
 * serviceCollection.addSingleton('configService', async (provider) => {
 *   return new ConfigService();
 * }, async (instance, provider) => {
 *   // Dispose logic here
 * });
 *
 * const serviceProvider = DIServiceProvider.create(serviceCollection);
 * const configService = await serviceProvider.getService<ConfigService>('configService');
 * if (configService.isPresent) {
 *   // Use the service
 * }
 * ```
 */
export class DIServiceProvider implements ServiceProvider {
    private readonly _serviceLifetime: ServiceLifetime;
    private _isDisposed: boolean = false;
    private _instances: Map<string, Instance>;
    private _rootServiceProvider: ServiceProvider;
    private _serviceCollection: ServiceCollection;

    /**
     * Creates a new instance of DIServiceProvider based on the provided service collection.
     *
     * @param {ServiceCollection} serviceCollection - The collection of services to build the provider.
     * @returns {ServiceProvider} A new instance of DIServiceProvider.
     *
     * @example Usage
     * ```typescript
     * const serviceProvider = DIServiceProvider.create(serviceCollection);
     * ```
     */
    static create(serviceCollection: ServiceCollection): ServiceProvider {
        const rootProvider: ServiceProvider = EmptyDIServiceProvider.instance();
        const instances: Map<string, Instance> = new Map<string, Instance>();
        const serviceLifetime: ServiceLifetime = ServiceLifetime.Singleton;

        return new DIServiceProvider(rootProvider, serviceCollection, serviceLifetime, instances);
    }

    private constructor(
        rootServiceProvider: ServiceProvider,
        serviceCollection: ServiceCollection,
        serviceLifetime: ServiceLifetime,
        instances: Map<string, Instance>,
    ) {
        this._rootServiceProvider = rootServiceProvider;
        this._serviceCollection = serviceCollection;
        this._serviceLifetime = serviceLifetime;
        this._instances = instances;
    }

    /**
     * Creates a new scoped service provider.
     *
     * @returns {ServiceProvider} A new scoped instance of DIServiceProvider.
     *
     * @example Usage
     * ```typescript
     * const scopedProvider = serviceProvider.createScope();
     * ```
     */
    public createScope(): ServiceProvider {
        this.ensureServiceProviderIsNotDisposed();

        let rootServiceProvider: ServiceProvider = this._rootServiceProvider;

        if (this._serviceLifetime === ServiceLifetime.Singleton) {
            rootServiceProvider = this;
        }

        const newScopedInstances: Map<string, Instance> = new Map<string, Instance>();

        return new DIServiceProvider(
            rootServiceProvider,
            this._serviceCollection,
            ServiceLifetime.Scoped,
            newScopedInstances,
        );
    }

    /**
     * Disposes the service provider and releases all it's own resources.
     *
     * @returns {Promise<void>} A promise that resolves when disposal is complete.
     *
     * @example Usage
     * ```typescript
     * await serviceProvider.dispose();
     * ```
     */
    public async dispose(): Promise<void> {
        this.ensureServiceProviderIsNotDisposed();

        const disposableInstances: Map<string, Instance> = this._instances;
        const serviceCollection: ServiceCollection = this._serviceCollection;

        this._isDisposed = true;
        this._rootServiceProvider = EmptyDIServiceProvider.instance();
        this._serviceCollection = EmptyDIServiceCollection.instance();
        this._instances = new Map<string, Instance>();

        for (const [key, instance] of disposableInstances) {
            const serviceBindingOptional: Optional<ServiceBinding> = serviceCollection.find(key);

            if (serviceBindingOptional.isPresent) {
                await this.disposeService(serviceBindingOptional.value, instance);
            }
        }
    }

    /**
     * Retrieves a service instance by its key.
     *
     * @param {string} key - The unique key representing the service.
     * @returns {Promise<Optional<Type>>} An Optional containing the service instance if found, otherwise empty.
     *
     * @example Usage
     * ```typescript
     * const userServiceOptional = await serviceProvider.getService<UserService>('userService');
     * if (userServiceOptional.isPresent) {
     *   const userService = userServiceOptional.value;
     *   // Use the service
     * }
     * ```
     */
    public async getService<Type>(key: string): Promise<Optional<Type>> {
        this.ensureServiceProviderIsNotDisposed();

        const transientOptional: Optional<Type> = await this.resolveTransientService<Type>(key);

        if (transientOptional.isPresent) {
            return transientOptional;
        }

        const localOptional: Optional<Type> = await this.resolveLocalService<Type>(key);

        if (localOptional.isPresent) {
            return localOptional;
        }

        return await this.resolveRootService<Type>(key);
    }

    private async resolveTransientService<Type>(key: string): Promise<Optional<Type>> {
        const serviceBindingOptional = this._serviceCollection
            .find(key)
            .filter((binding) => binding.serviceLifetime === ServiceLifetime.Transient);

        if (serviceBindingOptional.isPresent) {
            const instance: Instance = await this.createInstance(serviceBindingOptional.value);
            return Optional.ofNullable<Type>(instance as Type);
        }

        return Optional.empty<Type>();
    }

    private async resolveLocalService<Type>(key: string): Promise<Optional<Type>> {
        if (this._instances.has(key)) {
            return Optional.ofNullable<Type>(this._instances.get(key) as Type);
        }

        const serviceBindingOptional = this._serviceCollection
            .find(key)
            .filter((binding) => binding.serviceLifetime === this._serviceLifetime);

        if (!serviceBindingOptional.isPresent) {
            return Optional.empty<Type>();
        }

        const instance: Type = await this.addInstance<Type>(key, serviceBindingOptional.value);
        return Optional.ofNullable<Type>(instance);
    }

    private async resolveRootService<Type>(key: string): Promise<Optional<Type>> {
        return await this._rootServiceProvider.getService<Type>(key);
    }

    private async addInstance<Type>(key: string, binding: ServiceBinding): Promise<Type> {
        const instance: Instance = await this.createInstance(binding);
        this.saveInstance(key, instance);
        return instance as Type;
    }

    private async createInstance(binding: ServiceBinding): Promise<Instance> {
        const instance: Instance = await binding.serviceFactory(this);
        return instance;
    }

    private saveInstance(key: string, instance: Instance): void {
        this._instances.set(key, instance);
    }

    private ensureServiceProviderIsNotDisposed(): void {
        if (this._isDisposed) {
            throw new IllegalStateException('Service provider has been disposed');
        }
    }

    private async disposeService(
        serviceBinding: ServiceBinding,
        instance: Instance,
    ): Promise<void> {
        try {
            await serviceBinding.serviceDisposer!(instance, this);
        } catch (error) {
            throw new IllegalStateException(`Failed to dispose service: ${error}`);
        }
    }
}
