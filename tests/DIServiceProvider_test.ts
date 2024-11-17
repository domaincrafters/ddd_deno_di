/*
 * Copyright (c) 2024 Matthias Blomme and Dimitri Casier
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import {
    DIServiceCollection,
    DIServiceProvider,
    Instance,
    ServiceFactory,
    ServiceProvider,
} from '@domaincrafters/di/mod.ts';
import { assert, assertEquals, assertNotEquals, assertRejects, assertThrows } from '@std/assert';

interface ConfigService {
    config: number;
}

interface UserService {
    user: string;
}

Deno.test('DIServiceProvider - retrieves singleton service instance', async () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'configService';
    const serviceInstance = { config: 1 };
    const serviceFactory: ServiceFactory = async (_provider) => serviceInstance;

    serviceCollection.addSingleton(serviceKey, serviceFactory);
    const serviceProvider = DIServiceProvider.create(serviceCollection);

    // Act
    const serviceOptional = await serviceProvider.getService<ConfigService>(
        serviceKey,
    );

    // Assert
    assert(serviceOptional.isPresent);
    assertEquals(serviceOptional.value, serviceInstance);
    assertEquals(serviceOptional.value.config, 1);
});

Deno.test('DIServiceProvider - singleton service returns same instance', async () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'configService';
    let instanceCount = 0;
    const serviceFactory: ServiceFactory = async (_provider) => {
        instanceCount++;
        return { config: instanceCount };
    };

    serviceCollection.addSingleton(serviceKey, serviceFactory);
    const serviceProvider = DIServiceProvider.create(serviceCollection);
    const serviceOptional1 = await serviceProvider.getService<ConfigService>(
        serviceKey,
    );

    // Act
    const serviceOptional2 = await serviceProvider.getService<ConfigService>(
        serviceKey,
    );

    // Assert
    assert(serviceOptional1.isPresent);
    assert(serviceOptional2.isPresent);
    assertEquals(serviceOptional1.value.config, serviceOptional2.value.config);
    assertEquals(instanceCount, 1);
});

Deno.test('DIServiceProvider - scoped service returns same instance within scope', async () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'userService';
    let instanceCount = 0;
    const serviceFactory: ServiceFactory = async (_provider) => {
        instanceCount++;
        return { user: 'John Doe' };
    };

    serviceCollection.addScoped(serviceKey, serviceFactory);
    const rootProvider = DIServiceProvider.create(serviceCollection);
    const scopeProvider = rootProvider.createScope();

    // Act
    const serviceOptional1 = await scopeProvider.getService<UserService>(
        serviceKey,
    );
    const serviceOptional2 = await scopeProvider.getService<UserService>(
        serviceKey,
    );

    // Assert
    assert(serviceOptional1.isPresent);
    assert(serviceOptional2.isPresent);
    assertEquals(serviceOptional1.value, serviceOptional2.value);
    assertEquals(instanceCount, 1);
});

Deno.test('DIServiceProvider - scoped service returns different instances across scopes', async () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'userService';
    let instanceCount = 0;
    const serviceFactory: ServiceFactory = async (_provider) => {
        instanceCount++;
        return { user: 'John Doe' + instanceCount };
    };

    serviceCollection.addScoped(serviceKey, serviceFactory);
    const rootProvider = DIServiceProvider.create(serviceCollection);
    const scopeProvider1 = rootProvider.createScope();
    const scopeProvider2 = rootProvider.createScope();

    // Act
    const serviceOptional1 = await scopeProvider1.getService<UserService>(
        serviceKey,
    );
    const serviceOptional2 = await scopeProvider2.getService<UserService>(
        serviceKey,
    );

    // Assert
    assert(serviceOptional1.isPresent);
    assert(serviceOptional2.isPresent);
    assertNotEquals(serviceOptional1.value, serviceOptional2.value);
    assertEquals(instanceCount, 2);
});

Deno.test('DIServiceProvider - getService returns empty Optional when service not found', async () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceProvider = DIServiceProvider.create(serviceCollection);

    // Act
    const serviceOptional = await serviceProvider.getService('nonExistentService');

    // Assert
    assert(!serviceOptional.isPresent);
});

Deno.test('DIServiceProvider - transient service returns new instance each time', async () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'userService';
    let instanceCount = 0;
    const serviceFactory: ServiceFactory = async (_provider) => {
        instanceCount++;
        return { user: 'John Doe' + instanceCount };
    };

    serviceCollection.addTransient(serviceKey, serviceFactory);
    const serviceProvider = DIServiceProvider.create(serviceCollection);

    // Act
    const serviceOptional1 = await serviceProvider.getService<UserService>(
        serviceKey,
    );
    const serviceOptional2 = await serviceProvider.getService<UserService>(
        serviceKey,
    );

    // Assert
    assert(serviceOptional1.isPresent);
    assert(serviceOptional2.isPresent);
    assertNotEquals(serviceOptional1.value, serviceOptional2.value);
    assertEquals(instanceCount, 2);
});

Deno.test('DIServiceProvider - serviceDisposer disposes current scope instances', async () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'userService';
    let instanceCount = 0;
    const serviceFactory: ServiceFactory = async (_provider) => {
        instanceCount++;
        return { user: 'John Doe' + instanceCount };
    };

    serviceCollection.addScoped(serviceKey, serviceFactory);
    const rootProvider = DIServiceProvider.create(serviceCollection);
    const scopeProvider = rootProvider.createScope();
    await scopeProvider.getService<UserService>(serviceKey);

    // Act
    scopeProvider.dispose();

    // Assert
    assertRejects(async () => await scopeProvider.getService<UserService>(serviceKey));
    assertEquals(instanceCount, 1);
});

Deno.test('DIServiceProvider - non root serviceProvider cannot dispose singleton instances', async () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'userService';
    let instanceCount = 0;
    const serviceFactory: ServiceFactory = async (_provider) => {
        instanceCount++;
        return { user: 'John Doe' + instanceCount };
    };

    serviceCollection.addSingleton(serviceKey, serviceFactory);
    const rootProvider = DIServiceProvider.create(serviceCollection);
    const scopeProvider = rootProvider.createScope();
    await rootProvider.getService<UserService>(serviceKey);
    await scopeProvider.getService<UserService>(serviceKey);

    // Act
    scopeProvider.dispose();

    // Assert
    assertEquals(instanceCount, 1);
    assert((await rootProvider.getService<UserService>(serviceKey)).isPresent);
});

Deno.test('DIServiceProvider - getService throws when disposed', async () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'userService';
    const serviceFactory: ServiceFactory = async (_provider) => {
        return { user: 'John Doe' };
    };

    serviceCollection.addTransient(serviceKey, serviceFactory);
    const serviceProvider = DIServiceProvider.create(serviceCollection);
    await serviceProvider.dispose();

    // Act & Assert
    assertRejects(async () => await serviceProvider.getService<UserService>(serviceKey));
});

Deno.test('DIServiceProvider - createScope throws when disposed', async () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceProvider = DIServiceProvider.create(serviceCollection);
    serviceProvider.dispose();

    // Act & Assert
    assertThrows(() => serviceProvider.createScope());
});

Deno.test('DIServiceProvider - looks up rootProvider when service not found', async () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'userService';
    const service = { user: 'John Doe' };
    const serviceFactory: ServiceFactory = async (_provider) => service;

    serviceCollection.addSingleton(serviceKey, serviceFactory);
    const rootProvider = DIServiceProvider.create(serviceCollection);
    const scopeProvider = rootProvider.createScope();

    // Act
    const serviceOptional = await scopeProvider.getService<UserService>(serviceKey);

    // Assert
    assert(serviceOptional.isPresent);
    assertEquals(serviceOptional.value, service);
});

Deno.test('DIServiceProvider - looks for transient services first', async () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'userService';
    const service = { user: 'John Doe' };
    const serviceFactory: ServiceFactory = async (_provider) => service;

    serviceCollection.addTransient(serviceKey, serviceFactory);
    const rootProvider = DIServiceProvider.create(serviceCollection);
    const scopeProvider = rootProvider.createScope();

    // Act
    const serviceOptional = await scopeProvider.getService<UserService>(serviceKey);

    // Assert
    assert(serviceOptional.isPresent);
    assertEquals(serviceOptional.value, service);
});

Deno.test('DIServiceProvider - looks for scoped services second', async () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'userService';
    const service = { user: 'John Doe' };
    const serviceFactory: ServiceFactory = async (_provider) => service;

    serviceCollection.addScoped(serviceKey, serviceFactory);
    const rootProvider = DIServiceProvider.create(serviceCollection);
    const scopeProvider = rootProvider.createScope();

    // Act
    const serviceOptional = await scopeProvider.getService<UserService>(serviceKey);

    // Assert
    assert(serviceOptional.isPresent);
    assertEquals(serviceOptional.value, service);
});

Deno.test('DIServiceProvder - throws when a sevice disposer fails', async () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'userService';
    const serviceFactory: ServiceFactory = async (_provider) => {
        return { user: 'John Doe' };
    };
    let disposerCalled = false;
    const serviceDisposer = async (_instance: Instance, _provider: ServiceProvider) => {
        disposerCalled = true;
        throw new Error('Failed to dispose service');
    };

    serviceCollection.addScoped(serviceKey, serviceFactory, serviceDisposer);
    const rootProvider = DIServiceProvider.create(serviceCollection);
    const scopeProvider = rootProvider.createScope();
    await scopeProvider.getService<UserService>(serviceKey);

    // Act & Assert
    assertRejects(async () => await scopeProvider.dispose());
    assert(disposerCalled);
});

Deno.test('DIServiceProvider - throws when finding a service on a disposed provider', async () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'userService';
    const serviceFactory: ServiceFactory = async (_provider) => {
        return { user: 'John Doe' };
    };

    serviceCollection.addTransient(serviceKey, serviceFactory);
    const serviceProvider = DIServiceProvider.create(serviceCollection);
    await serviceProvider.dispose();

    // Act & Assert
    assertRejects(() => serviceProvider.getService<UserService>(serviceKey));
});
