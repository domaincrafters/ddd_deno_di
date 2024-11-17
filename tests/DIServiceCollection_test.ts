/*
 * Copyright (c) 2024 Matthias Blomme and Dimitri Casier
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { DIServiceCollection, ServiceFactory, ServiceDisposer, ServiceProvider } from '@domaincrafters/di/mod.ts';
import { assert, assertEquals } from '@std/assert';

Deno.test('DIServiceCollection - addSingleton adds a singleton service', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'configService';
    const createCallback: ServiceFactory = async (_provider) => ({
        config: 'value',
    });
    const serviceDisposer: ServiceDisposer = async (_provider) => {};

    // Act
    serviceCollection.addSingleton(serviceKey, createCallback, serviceDisposer);

    // Assert
    assert(serviceCollection.singleton.has(serviceKey));
    const binding = serviceCollection.singleton.get(serviceKey);
    assert(binding !== undefined);
    assertEquals(binding?.serviceFactory, createCallback);
    assertEquals(binding?.serviceDisposer, serviceDisposer);
});

Deno.test('DIServiceCollection - addSingleton adds a singleton service with default disposer callback', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'configService';
    const createCallback: ServiceFactory = async (_provider) => ({
        config: 'value',
    });

    // Act
    serviceCollection.addSingleton(serviceKey, createCallback)
                .addSingleton(serviceKey, createCallback);

    // Assert
    assert(serviceCollection.singleton.has(serviceKey));
    const binding = serviceCollection.singleton.get(serviceKey);
    assert(binding !== undefined);
    assertEquals(binding?.serviceFactory, createCallback);
    assert(typeof binding.serviceDisposer === 'function');
});

Deno.test('DIServiceCollection - addScoped adds a scoped service', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'userService';
    const createCallback: ServiceFactory = async (_provider) => ({
        user: 'John Doe',
    });
    const serviceDisposer: ServiceDisposer = async (_provider) => {};

    // Act
    serviceCollection.addScoped(serviceKey, createCallback, serviceDisposer);

    // Assert
    assert(serviceCollection.scoped.has(serviceKey));
    const binding = serviceCollection.scoped.get(serviceKey);
    assert(binding !== undefined);
    assertEquals(binding?.serviceFactory, createCallback);
    assertEquals(binding?.serviceDisposer, serviceDisposer);
});

Deno.test('DIServiceCollection - adding a scoped service with the same key as a singleton service overrides it', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'config';
    const createCallback1: ServiceFactory = async (_provider) => ({
        config: 'value1',
    });
    const createCallback2: ServiceFactory = async (_provider) => ({
        config: 'value2',
    });

    serviceCollection.addSingleton(serviceKey, createCallback1);

    // Act
    serviceCollection.addScoped(serviceKey, createCallback2);

    // Assert
    const binding = serviceCollection.find(serviceKey).value;
    assert(binding !== undefined);
    assertEquals(binding?.serviceFactory, createCallback2);
});

Deno.test('DIServiceCollection - adding a scoped service with the same key as a transient service overrides it', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'logging';
    const createCallback1: ServiceFactory = async (_provider) => ({
        log: () => {},
    });
    const createCallback2: ServiceFactory = async (_provider) => ({
        log: () => {},
    });

    serviceCollection.addTransient(serviceKey, createCallback1);

    // Act
    serviceCollection.addScoped(serviceKey, createCallback2);

    // Assert
    const binding = serviceCollection.find(serviceKey).value;
    assert(binding !== undefined);
    assertEquals(binding?.serviceFactory, createCallback2);
});

Deno.test('DIServiceCollection - adding a singleton service with the same key as a transient service overrides it', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'config';

    const createCallback1: ServiceFactory = async (_provider) => ({
        config: 'value1',
    });
    const createCallback2: ServiceFactory = async (_provider) => ({
        config: 'value2',
    });

    serviceCollection.addTransient(serviceKey, createCallback1);

    // Act
    serviceCollection.addSingleton(serviceKey, createCallback2);

    // Assert
    const binding = serviceCollection.find(serviceKey).value;
    assert(binding !== undefined);
    assertEquals(binding?.serviceFactory, createCallback2);
});


Deno.test('DIServiceCollection - adding a transient service with the same key as a singleton service overrides it', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'logging';
    const createCallback1: ServiceFactory = async (_provider) => ({
        log: () => {},
    });
    const createCallback2: ServiceFactory = async (_provider) => ({
        log: () => {},
    });

    serviceCollection.addSingleton(serviceKey, createCallback1);
    

    // Act
    serviceCollection.addTransient(serviceKey, createCallback2);

    // Assert
    const binding = serviceCollection.find(serviceKey).value;
    assert(binding !== undefined);
    assertEquals(binding?.serviceFactory, createCallback2);
});


Deno.test('DIServiceCollection - adding a transient service with the same key as a scoped service overrides it', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'logging';
    const createCallback1: ServiceFactory = async (_provider) => ({
        log: () => {},
    });
    const createCallback2: ServiceFactory = async (_provider) => ({
        log: () => {},
    });

    serviceCollection.addScoped(serviceKey, createCallback1);

    // Act
    serviceCollection.addTransient(serviceKey, createCallback2);

    // Assert
    const binding = serviceCollection.find(serviceKey).value;
    assert(binding !== undefined);
    assertEquals(binding?.serviceFactory, createCallback2);
});

Deno.test('DIServiceCollection - addTransient adds a transient service', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'loggingService';
    const createCallback: ServiceFactory = async (_provider) => ({
        log: () => {},
    });
    const serviceDisposer: ServiceDisposer = async (_provider) => {};

    // Act
    serviceCollection.addTransient(serviceKey, createCallback, serviceDisposer);

    // Assert
    assert(serviceCollection.transient.has(serviceKey));
    const binding = serviceCollection.transient.get(serviceKey);
    assert(binding !== undefined);
    assertEquals(binding?.serviceFactory, createCallback);
    assertEquals(binding?.serviceDisposer, serviceDisposer);
});

Deno.test('DIServiceCollection - overwrite existing singleton service on duplicate key', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'configService';
    const createCallback1: ServiceFactory = async (_provider) => ({
        config: 'value1',
    });
    const createCallback2: ServiceFactory = async (_provider) => ({
        config: 'value2',
    });

    // Act
    serviceCollection.addSingleton(serviceKey, createCallback1);
    serviceCollection.addSingleton(serviceKey, createCallback2);

    // Assert
    const binding = serviceCollection.singleton.get(serviceKey);
    assert(binding !== undefined);
    assertEquals(binding?.serviceFactory, createCallback2);
});

Deno.test('DIServiceCollection - overwrite existing scoped service on duplicate key', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'userService';
    const createCallback1: ServiceFactory = async (_provider) => ({
        user: 'John Doe 1',
    });
    const createCallback2: ServiceFactory = async (_provider) => ({
        user: 'John Doe 2',
    });

    // Act
    serviceCollection.addScoped(serviceKey, createCallback1);
    serviceCollection.addScoped(serviceKey, createCallback2);

    // Assert
    const binding = serviceCollection.scoped.get(serviceKey);
    assert(binding !== undefined);
    assertEquals(binding?.serviceFactory, createCallback2);
});

Deno.test('DIServiceCollection - overwrite existing transient service on duplicate key', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'logging';
    const createCallback1: ServiceFactory = async (_provider) => ({
        log: () => {},
    });
    const createCallback2: ServiceFactory = async (_provider) => ({
        log: () => {},
    });

    // Act
    serviceCollection.addTransient(serviceKey, createCallback1);
    serviceCollection.addTransient(serviceKey, createCallback2);

    // Assert
    const binding = serviceCollection.transient.get(serviceKey);
    assert(binding !== undefined);
    assertEquals(binding?.serviceFactory, createCallback2);
});

Deno.test('DIServiceCollection - find returns binding for existing service', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'configService';
    const createCallback: ServiceFactory = async (_provider) => ({
        config: 'value',
    });

    serviceCollection.addSingleton(serviceKey, createCallback);

    // Act
    const bindingOptional = serviceCollection.find(serviceKey);

    // Assert
    assert(bindingOptional.isPresent);
    const binding = bindingOptional.value;
    assertEquals(binding.serviceFactory, createCallback);
});

Deno.test('DIServiceCollection - find returns empty for non-existing service', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'configService';

    // Act
    const bindingOptional = serviceCollection.find(serviceKey);

    // Assert
    assert(!bindingOptional.isPresent);
});

Deno.test('DIServiceCollection - scoped returns scoped bindings', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'userService';
    const createCallback: ServiceFactory = async (_provider) => ({
        user: 'John Doe',
    });

    serviceCollection.addScoped(serviceKey, createCallback);

    // Act
    const scopedBindings = serviceCollection.scoped;

    // Assert
    assert(scopedBindings.has(serviceKey));
    const binding = scopedBindings.get(serviceKey);
    assert(binding !== undefined);
    assertEquals(binding?.serviceFactory, createCallback);
});

Deno.test('DIServiceCollection - singleton returns singleton bindings', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'config';
    const createCallback: ServiceFactory = async (_provider) => ({
        config: 'value',
    });

    serviceCollection.addSingleton(serviceKey, createCallback);

    // Act
    const singletonBindings = serviceCollection.singleton;

    // Assert
    assert(singletonBindings.has(serviceKey));
    const binding = singletonBindings.get(serviceKey);
    assert(binding !== undefined);
    assertEquals(binding?.serviceFactory, createCallback);
});

Deno.test('DIServiceCollection - transient returns transient bindings', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'logging';
    const createCallback: ServiceFactory = async (_provider) => ({
        log: () => {},
    });

    serviceCollection.addTransient(serviceKey, createCallback);

    // Act
    const transientBindings = serviceCollection.transient;

    // Assert
    assert(transientBindings.has(serviceKey));
    const binding = transientBindings.get(serviceKey);
    assert(binding !== undefined);
    assertEquals(binding?.serviceFactory, createCallback);
});

Deno.test('DIServiceCollection - create returns a new instance of the service collection', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();

    // Act
    const newServiceCollection = DIServiceCollection.create();

    // Assert
    assert(serviceCollection !== newServiceCollection);
});

Deno.test('DIServiceCollection - create returns an empty service collection', () => {
    // Act
    const newServiceCollection = DIServiceCollection.create();

    // Assert
    assertEquals(newServiceCollection.scoped.size, 0);
    assertEquals(newServiceCollection.singleton.size, 0);
    assertEquals(newServiceCollection.transient.size, 0);
});

Deno.test('DIServiceCollection - adding a scoped service finds it in the service collection', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'userService';
    const createCallback: ServiceFactory = async (_provider) => ({
        user: 'John Doe',
    });
    serviceCollection.addScoped(serviceKey, createCallback);

    // Act
    const bindingOptional = serviceCollection.find(serviceKey);

    // Assert
    assert(bindingOptional.isPresent);
    const binding = bindingOptional.value;
    assertEquals(binding.serviceFactory, createCallback);
});

Deno.test('DIServiceCollection - adding a singleton service finds it in the service collection', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'configService';
    const createCallback: ServiceFactory = async (_provider) => ({
        config: 'value',
    });
    serviceCollection.addSingleton(serviceKey, createCallback);

    // Act
    const bindingOptional = serviceCollection.find(serviceKey);

    // Assert
    assert(bindingOptional.isPresent);
    const binding = bindingOptional.value;
    assertEquals(binding.serviceFactory, createCallback);
});

Deno.test('DIServiceCollection - adding a transient service finds it in the service collection', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey = 'logging';
    const createCallback: ServiceFactory = async (_provider) => ({
        log: () => {},
    });
    serviceCollection.addTransient(serviceKey, createCallback);

    // Act
    const bindingOptional = serviceCollection.find(serviceKey);

    // Assert
    assert(bindingOptional.isPresent);
    const binding = bindingOptional.value;
    assertEquals(binding.serviceFactory, createCallback);
});

Deno.test('DIServiceCollection - chaining service collection methods', () => {
    // Arrange
    const serviceCollection = DIServiceCollection.create();
    const serviceKey1 = 'configService';
    const serviceKey2 = 'userService';
    const serviceKey3 = 'logging';

    // Act
    serviceCollection
        .addSingleton(serviceKey1, async (_provider: ServiceProvider) => ({ config: 'value' }))
        .addScoped(serviceKey2, async (_provider: ServiceProvider) => ({ user: 'John Doe' }))
        .addTransient(serviceKey3, async (_provider: ServiceProvider) => ({ log: () => {} }));

    // Assert
    assert(serviceCollection.singleton.has(serviceKey1));
    assert(serviceCollection.scoped.has(serviceKey2));
    assert(serviceCollection.transient.has(serviceKey3));
});

