/*
 * Copyright (c) 2024 Matthias Blomme and Dimitri Casier
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import type { ServiceBinding, ServiceDisposer, ServiceFactory } from '@domaincrafters/di/mod.ts';
import type { Optional } from '@domaincrafters/std';

export interface ServiceCollection {
    addScoped<Type>(
        key: string,
        serviceFactory: ServiceFactory,
        serviceDisposer?: ServiceDisposer<Type>,
    ): ServiceCollection;

    addSingleton<Type>(
        key: string,
        serviceFactory: ServiceFactory,
        serviceDisposer?: ServiceDisposer<Type>,
    ): ServiceCollection;

    addTransient(
        key: string,
        serviceFactory: ServiceFactory,
    ): ServiceCollection;

    get scoped(): Map<string, ServiceBinding>;

    get singleton(): Map<string, ServiceBinding>;

    get transient(): Map<string, ServiceBinding>;

    find(key: string): Optional<ServiceBinding>;
}
