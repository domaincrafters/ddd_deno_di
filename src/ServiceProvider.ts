/*
 * Copyright (c) 2024 Matthias Blomme and Dimitri Casier
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import type { Optional } from '@domaincrafters/std';

/**
 * Defines the possible lifetimes of a service in the dependency injection system.
 *
 * @example Usage
 * ```typescript
 * // Register services with different lifetimes
 * serviceCollection.addSingleton('configService', configServiceFactory);
 * serviceCollection.addScoped('userService', userServiceFactory);
 * serviceCollection.addTransient('loggingService', loggingServiceFactory);
 * ```
 */
export enum ServiceLifetime {
    Singleton = 'Singleton',
    Scoped = 'Scoped',
    Transient = 'Transient',
}

/**
 * Represents a binding of a service, including its lifetime, factory, and optional disposer.
 *
 * @example Usage
 * ```typescript
 * const binding: ServiceBinding = {
 *   serviceLifetime: ServiceLifetime.Singleton,
 *   serviceFactory: async (provider) => new ConfigService(),
 *   serviceDisposer: async (instance, provider) => {
 *     // Dispose logic
 *   }
 * };
 * ```
 */
export interface ServiceBinding {
    serviceLifetime: ServiceLifetime;
    serviceFactory: ServiceFactory;
    serviceDisposer?: ServiceDisposer;
}

/**
 * Represents an instance of a service.
 *
 * @remarks
 * This is a generic representation and can be any object.
 *
 * @example Usage
 * ```typescript
 * const instance: Instance = new MyService();
 * ```
 */
export interface Instance {
    // deno-lint-ignore no-explicit-any
    [key: string]: any;
}

/**
 * Defines the contract for a service provider capable of resolving services.
 *
 * @example Usage
 * ```typescript
 * const serviceProvider: ServiceProvider = DIServiceProvider.create(serviceCollection);
 * const userServiceOptional = await serviceProvider.getService<UserService>('userService');
 * if (userServiceOptional.isPresent) {
 *   const userService = userServiceOptional.value;
 *   // Use the service
 * }
 * ```
 */
export interface ServiceProvider {
    /**
     * Creates a new scoped service provider.
     *
     * @returns {ServiceProvider} A new scoped instance.
     *
     * @example Usage
     * ```typescript
     * const scopedProvider = serviceProvider.createScope();
     * ```
     */
    createScope(): ServiceProvider;

    /**
     * Retrieves a service instance by its key.
     *
     * @param {string} key - The unique key representing the service.
     * @returns {Promise<Optional<Type>>} An Optional containing the service instance if found, otherwise empty.
     *
     * @example Usage
     * ```typescript
     * const myServiceOptional = await serviceProvider.getService<MyService>('myService');
     * if (myServiceOptional.isPresent) {
     *   const myService = myServiceOptional.value;
     *   // Use the service
     * }
     * ```
     */
    getService<Type>(key: string): Promise<Optional<Type>>;

    /**
     * Disposes the service provider and releases all resources.
     *
     * @returns {Promise<void>} A promise that resolves when disposal is complete.
     *
     * @example Usage
     * ```typescript
     * await serviceProvider.dispose();
     * ```
     */
    dispose(): Promise<void>;
}

/**
 * Represents a factory function that creates a service instance.
 *
 * @param {ServiceProvider} serviceProvider - The service provider to resolve dependencies.
 * @returns {Promise<Instance>} A promise that resolves to the created service instance.
 *
 * @example Usage
 * ```typescript
 * const userServiceFactory: ServiceFactory = async (provider) => {
 *   const configService = await provider.getService<ConfigService>('configService');
 *   return new UserService(configService.value);
 * };
 * ```
 */
export type ServiceFactory = (
    serviceProvider: ServiceProvider,
) => Promise<Instance>;

/**
 * Represents a disposer function that disposes a service instance.
 *
 * @param {Instance} instance - The service instance to dispose.
 * @param {ServiceProvider} serviceProvider - The service provider.
 * @returns {Promise<void>} A promise that resolves when disposal is complete.
 *
 * @example Usage
 * ```typescript
 * const userServiceDisposer: ServiceDisposer = async (instance, provider) => {
 *   await instance.cleanup();
 * };
 * ```
 */
export type ServiceDisposer = (
    instance: Instance,
    serviceProvider: ServiceProvider,
) => Promise<void>;

/**
 * The default service disposer function that does nothing.
 *
 * @example Usage
 * ```typescript
 * // Used internally when no disposer is provided.
 * ```
 */
export const defaultServiceDisposer: ServiceDisposer = async (
    _instance: Instance,
    _serviceProvider: ServiceProvider,
): Promise<void> => {};
