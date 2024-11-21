/*
 * Copyright (c) 2024 Matthias Blomme and Dimitri Casier
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import {
    defaultServiceDisposer,
    type ServiceBinding,
    type ServiceCollection,
    type ServiceDisposer,
    type ServiceFactory,
    ServiceLifetime,
} from '@domaincrafters/di/mod.ts';
import { Optional } from '@domaincrafters/std';

/**
 * Represents a collection of service descriptors used to build a ServiceProvider.
 *
 * @example Usage
 * ```typescript
 * const serviceCollection = DIServiceCollection.create();
 *
 * serviceCollection.addSingleton('configService', async (provider) => {
 *   return new ConfigService();
 * }, async (instance, provider) => {
 *   // Dispose logic here
 * });
 *
 * serviceCollection.addScoped('userService', async (provider) => {
 *   return new UserService();
 * });
 *
 * serviceCollection.addTransient('loggingService', async (provider) => {
 *   return new LoggingService();
 * });
 * ```
 */
export class DIServiceCollection implements ServiceCollection {
    private readonly _serviceBindings: Map<string, ServiceBinding> = new Map<
        string,
        ServiceBinding
    >();

    /**
     * Creates a new instance of DIServiceCollection.
     *
     * @returns {ServiceCollection} A new instance of DIServiceCollection.
     *
     * @example Usage
     * ```typescript
     * const serviceCollection = DIServiceCollection.create();
     * ```
     */
    static create(): ServiceCollection {
        return new DIServiceCollection();
    }

    /**
     * Adds a transient service to the collection.
     *
     * @param {string} key - The unique key representing the service.
     * @param {ServiceFactory} serviceFactory - The factory function to create the service instance.
     * @param {ServiceDisposer} [serviceDisposer] - Optional disposer function to dispose the service instance.
     * @returns {ServiceCollection} The service collection for chaining.
     *
     * @example Usage
     * ```typescript
     * serviceCollection.addTransient('loggingService', async (provider) => {
     *   return new LoggingService();
     * });
     * ```
     */
    addTransient(
        key: string,
        serviceFactory: ServiceFactory,
    ): ServiceCollection {
        return this.addService(key, ServiceLifetime.Transient, serviceFactory);
    }

    /**
     * Adds a scoped service of type Type to the collection.
     *
     * @generic Type - The type of the service to add.
     * @param {string} key - The unique key representing the service.
     * @param {ServiceFactory} serviceFactory - The factory function to create the service instance.
     * @param {ServiceDisposer<Type>} [serviceDisposer] - Optional disposer function to dispose the service instance.
     * @returns {ServiceCollection} The service collection for chaining.
     *
     * @example Usage
     * ```typescript
     * serviceCollection.addScoped('userService', async (provider) => {
     *   return new UserService();
     * });
     * ```
     */
    addScoped<Type>(
        key: string,
        serviceFactory: ServiceFactory,
        serviceDisposer?: ServiceDisposer<Type>,
    ): ServiceCollection {
        return this.addService(key, ServiceLifetime.Scoped, serviceFactory, serviceDisposer);
    }

    /**
     * Adds a singleton service of type Type to the collection.
     *
     * @generic Type - The type of the service to add.
     * @param {string} key - The unique key representing the service.
     * @param {ServiceFactory} serviceFactory - The factory function to create the service instance.
     * @param {ServiceDisposer} serviceDisposer - The disposer function to dispose the service instance.
     * @returns {ServiceCollection} The service collection for chaining.
     *
     * @example Usage
     * ```typescript
     * serviceCollection.addSingleton('configService', async (provider) => {
     *   return new ConfigService();
     * }, async (instance, provider) => {
     *   // Dispose logic here
     * });
     * ```
     */
    addSingleton<Type>(
        key: string,
        serviceFactory: ServiceFactory,
        serviceDisposer: ServiceDisposer<Type>,
    ): ServiceCollection {
        return this.addService(key, ServiceLifetime.Singleton, serviceFactory, serviceDisposer);
    }

    /**
     * Gets all scoped service bindings.
     *
     * @returns {Map<string, ServiceBinding>} A map of scoped service bindings.
     *
     * @example Usage
     * ```typescript
     * const scopedServices = serviceCollection.scoped;
     * ```
     */
    get scoped(): Map<string, ServiceBinding> {
        return this.getBindingsByLifetime(ServiceLifetime.Scoped);
    }

    /**
     * Gets all singleton service bindings.
     *
     * @returns {Map<string, ServiceBinding>} A map of singleton service bindings.
     *
     * @example Usage
     * ```typescript
     * const singletonServices = serviceCollection.singleton;
     * ```
     */
    get singleton(): Map<string, ServiceBinding> {
        return this.getBindingsByLifetime(ServiceLifetime.Singleton);
    }

    /**
     * Gets all transient service bindings.
     *
     * @returns {Map<string, ServiceBinding>} A map of transient service bindings.
     *
     * @example Usage
     * ```typescript
     * const transientServices = serviceCollection.transient;
     * ```
     */
    get transient(): Map<string, ServiceBinding> {
        return this.getBindingsByLifetime(ServiceLifetime.Transient);
    }

    /**
     * Finds a service binding by its key.
     *
     * @param {string} key - The unique key representing the service.
     * @returns {Optional<ServiceBinding>} An Optional containing the service binding if found, otherwise empty.
     *
     * @example Usage
     * ```typescript
     * const bindingOptional = serviceCollection.find('userService');
     * if (bindingOptional.isPresent) {
     *   const binding = bindingOptional.value;
     *   // Use the binding
     * }
     * ```
     */
    find(key: string): Optional<ServiceBinding> {
        const binding: ServiceBinding | undefined = this._serviceBindings.get(key);

        if (!binding) {
            return Optional.empty<ServiceBinding>();
        }

        return Optional.of<ServiceBinding>(binding);
    }

    private addService<Type>(
        key: string,
        serviceLifetime: ServiceLifetime,
        serviceFactory: ServiceFactory,
        serviceDisposer?: ServiceDisposer<Type>,
    ): ServiceCollection {
        this._serviceBindings.set(
            key,
            this.createBinding(serviceLifetime, serviceFactory, serviceDisposer),
        );
        return this;
    }

    private createBinding<Type>(
        serviceLifetime: ServiceLifetime,
        serviceFactory: ServiceFactory,
        serviceDisposer?: ServiceDisposer<Type>,
    ): ServiceBinding {
        const activeServiceDisposer: ServiceDisposer<Type> = serviceDisposer ??
            defaultServiceDisposer;

        const binding: ServiceBinding = {
            serviceLifetime,
            serviceFactory,
            serviceDisposer: activeServiceDisposer as ServiceDisposer<unknown>,
        };

        return binding;
    }

    private getBindingsByLifetime(serviceLifetime: ServiceLifetime): Map<string, ServiceBinding> {
        const bindings: Map<string, ServiceBinding> = new Map<string, ServiceBinding>();

        for (const [key, binding] of this._serviceBindings) {
            if (binding.serviceLifetime === serviceLifetime) {
                bindings.set(key, binding);
            }
        }

        return bindings;
    }

    private constructor() {}
}
