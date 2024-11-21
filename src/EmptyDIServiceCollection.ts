/*
 * Copyright (c) 2024 Matthias Blomme and Dimitri Casier
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import type {
    ServiceBinding,
    ServiceCollection,
    ServiceDisposer,
    ServiceFactory,
} from '@domaincrafters/di/mod.ts';
import { IllegalStateException, Optional } from '@domaincrafters/std';

/**
 * Represents an empty service collection that does not contain any services.
 * Used as a default or placeholder.
 *
 * @example Usage
 * ```typescript
 * const emptyCollection = EmptyDIServiceCollection.instance();
 * ```
 */
export class EmptyDIServiceCollection implements ServiceCollection {
    private static readonly _instance: EmptyDIServiceCollection = new EmptyDIServiceCollection();

    /**
     * Gets the singleton instance of EmptyDIServiceCollection.
     *
     * @returns {ServiceCollection} The singleton instance.
     *
     * @example Usage
     * ```typescript
     * const emptyCollection = EmptyDIServiceCollection.instance();
     * ```
     */
    static instance(): ServiceCollection {
        return EmptyDIServiceCollection._instance;
    }

    /**
     * Throws an IllegalStateException, as services cannot be added to an empty collection.
     *
     * @throws {IllegalStateException} Always thrown.
     *
     * @example Usage
     * ```typescript
     * try {
     *   emptyCollection.addScoped('myService', async (provider) => new MyService());
     * } catch (error) {
     *   // Handle error
     * }
     * ```
     */
    addScoped<Type>(
        _name: string,
        _serviceFactory: ServiceFactory,
        _serviceDisposer?: ServiceDisposer<Type>,
    ): ServiceCollection {
        return this.addService();
    }

    /**
     * Throws an IllegalStateException, as services cannot be added to an empty collection.
     *
     * @throws {IllegalStateException} Always thrown.
     *
     * @example Usage
     * ```typescript
     * try {
     *   emptyCollection.addSingleton('myService', async (provider) => new MyService());
     * } catch (error) {
     *   // Handle error
     * }
     * ```
     */
    addSingleton<Type>(
        _name: string,
        _serviceFactory: ServiceFactory,
        _serviceDisposer?: ServiceDisposer<Type>,
    ): ServiceCollection {
        return this.addService();
    }

    /**
     * Throws an IllegalStateException, as services cannot be added to an empty collection.
     *
     * @throws {IllegalStateException} Always thrown.
     *
     * @example Usage
     * ```typescript
     * try {
     *   emptyCollection.addTransient('myService', async (provider) => new MyService());
     * } catch (error) {
     *   // Handle error
     * }
     * ```
     */
    addTransient(
        _name: string,
        _serviceFactory: ServiceFactory,
    ): ServiceCollection {
        return this.addService();
    }

    /**
     * Always returns an empty Optional, as there are no services in the collection.
     *
     * @param {string} _key - The key of the service (ignored).
     * @returns {Optional<ServiceBinding>} An empty Optional.
     *
     * @example Usage
     * ```typescript
     * const bindingOptional = emptyCollection.find('myService');
     * // bindingOptional.isPresent === false
     * ```
     */
    find(_key: string): Optional<ServiceBinding> {
        return Optional.empty<ServiceBinding>();
    }

    /**
     * Always returns an empty Map, as there are no services in the collection.
     *
     * @returns {Map<string, ServiceBinding>} An empty Map.
     *
     * @example Usage
     * ```typescript
     * const scopedServices = emptyCollection.scoped;
     * // scopedServices.size === 0
     * ```
     */
    get scoped(): Map<string, ServiceBinding> {
        return new Map<string, ServiceBinding>();
    }

    /**
     * Always returns an empty Map, as there are no services in the collection.
     *
     * @returns {Map<string, ServiceBinding>} An empty Map.
     *
     * @example Usage
     * ```typescript
     * const singletonServices = emptyCollection.singleton;
     * // singletonServices.size === 0
     * ```
     */
    get singleton(): Map<string, ServiceBinding> {
        return new Map<string, ServiceBinding>();
    }

    /**
     * Always returns an empty Map, as there are no services in the collection.
     *
     * @returns {Map<string, ServiceBinding>} An empty Map.
     *
     * @example Usage
     * ```typescript
     * const transientServices = emptyCollection.transient;
     * // transientServices.size === 0
     * ```
     */
    get transient(): Map<string, ServiceBinding> {
        return new Map<string, ServiceBinding>();
    }

    private addService(): ServiceCollection {
        throw new IllegalStateException('Cannot add a service to an empty service collection');
    }

    private constructor() {}
}
