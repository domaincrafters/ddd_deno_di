/*
 * Copyright (c) 2024 Matthias Blomme and Dimitri Casier
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import type { ServiceProvider } from '@domaincrafters/di/mod.ts';
import { IllegalStateException, Optional } from '@domaincrafters/std';

/**
 * Represents an empty service provider that does not provide any services.
 * Used as a default or placeholder.
 *
 * @example Usage
 * ```typescript
 * const emptyProvider = EmptyDIServiceProvider.instance();
 * ```
 */
export class EmptyDIServiceProvider implements ServiceProvider {
    private static readonly _instance: EmptyDIServiceProvider = new EmptyDIServiceProvider();

    /**
     * Always returns an empty Optional, as no services are available.
     *
     * @param {string} _key - The key of the service (ignored).
     * @returns {Promise<Optional<Type>>} An empty Optional.
     *
     * @example Usage
     * ```typescript
     * const serviceOptional = await emptyProvider.getService<MyService>('myService');
     * // serviceOptional.isPresent === false
     * ```
     */
    getService<Type>(_key: string): Promise<Optional<Type>> {
        return Promise.resolve(Optional.empty<Type>());
    }

    /**
     * Does nothing, as there are no resources to dispose.
     *
     * @returns {Promise<void>} A resolved promise.
     *
     * @example Usage
     * ```typescript
     * await emptyProvider.dispose();
     * ```
     */
    public dispose(): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Throws an IllegalStateException, as scopes cannot be created from an empty service provider.
     *
     * @throws {IllegalStateException} Always thrown.
     *
     * @example Usage
     * ```typescript
     * try {
     *   const scope = emptyProvider.createScope();
     * } catch (error) {
     *   // Handle error
     * }
     * ```
     */
    public createScope(): ServiceProvider {
        throw new IllegalStateException('Cannot create a scope from an empty service provider');
    }

    /**
     * Gets the singleton instance of EmptyDIServiceProvider.
     *
     * @returns {EmptyDIServiceProvider} The singleton instance.
     *
     * @example Usage
     * ```typescript
     * const emptyProvider = EmptyDIServiceProvider.instance();
     * ```
     */
    public static instance(): EmptyDIServiceProvider {
        return EmptyDIServiceProvider._instance;
    }

    private constructor() {}
}
