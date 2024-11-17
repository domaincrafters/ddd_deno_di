/*
 * Copyright (c) 2024 Matthias Blomme and Dimitri Casier
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import type { Optional } from '@domaincrafters/std';

export enum ServiceLifetime {
    Singleton = 'Singleton',
    Scoped = 'Scoped',
    Transient = 'Transient',
}

export interface ServiceBinding {
    serviceLifetime: ServiceLifetime;
    serviceFactory: ServiceFactory;
    serviceDisposer?: ServiceDisposer;
}

export interface Instance {
    // Instance represents any object.
    // deno-lint-ignore no-explicit-any
    [key: string]: any;
}

export interface ServiceProvider {
    createScope(): ServiceProvider;

    getService<Type>(key: string): Promise<Optional<Type>>;

    dispose(): Promise<void>;
}

export type ServiceFactory = (
    serviceProvider: ServiceProvider,
) => Promise<Instance>;

export type ServiceDisposer = (
    instance: Instance,
    serviceProvider: ServiceProvider,
) => Promise<void>;

export const defaultServiceDisposer: ServiceDisposer = async (
    _instance: Instance,
    _serviceProvider: ServiceProvider,
): Promise<void> => {};
