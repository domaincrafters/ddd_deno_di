/*
 * Copyright (c) 2024 Matthias Blomme and Dimitri Casier
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { EmptyDIServiceCollection, ServiceFactory } from '@domaincrafters/di/mod.ts';
import { assertEquals, assertThrows } from '@std/assert';

Deno.test('EmptyDIServiceCollection - addScoped throws', () => {
    // Arrange
    const serviceCollection = EmptyDIServiceCollection.instance();
    const serviceKey = 'userService';
    const serviceFactory: ServiceFactory = async (_provider) => {
        return { user: 'John Doe' };
    };

    // Act & Assert
    assertThrows(() => serviceCollection.addScoped(serviceKey, serviceFactory));
});

Deno.test('EmptyDIServiceCollection - addSingleton throws', () => {
    // Arrange
    const serviceCollection = EmptyDIServiceCollection.instance();
    const serviceKey = 'userService';
    const serviceFactory: ServiceFactory = async (_provider) => {
        return { user: 'John Doe' };
    };

    // Act & Assert
    assertThrows(() => serviceCollection.addSingleton(serviceKey, serviceFactory));
});

Deno.test('EmptyDIServiceCollection - addTransient throws', () => {
    // Arrange
    const serviceCollection = EmptyDIServiceCollection.instance();
    const serviceKey = 'userService';
    const serviceFactory: ServiceFactory = async (_provider) => {
        return { user: 'John Doe' };
    };

    // Act & Assert
    assertThrows(() => serviceCollection.addTransient(serviceKey, serviceFactory));
});

Deno.test('EmptyDIServiceCollection - find returns empty', () => {
    // Arrange
    const serviceCollection = EmptyDIServiceCollection.instance();
    const serviceKey = 'userService';

    // Act
    const serviceBinding = serviceCollection.find(serviceKey);

    // Assert
    assertEquals(serviceBinding.isPresent, false);
});


Deno.test('EmptyDIServiceCollection - scoped returns empty map', () => {
    // Arrange
    const serviceCollection = EmptyDIServiceCollection.instance();

    // Act
    const scopedBindings = serviceCollection.scoped;

    // Assert
    assertEquals(scopedBindings.size, 0);
});

Deno.test('EmptyDIServiceCollection - singleton returns empty map', () => {
    // Arrange
    const serviceCollection = EmptyDIServiceCollection.instance();

    // Act
    const singletonBindings = serviceCollection.singleton;

    // Assert
    assertEquals(singletonBindings.size, 0);
});

Deno.test('EmptyDIServiceCollection - transient returns empty map', () => {
    // Arrange
    const serviceCollection = EmptyDIServiceCollection.instance();

    // Act
    const transientBindings = serviceCollection.transient;

    // Assert
    assertEquals(transientBindings.size, 0);

});
