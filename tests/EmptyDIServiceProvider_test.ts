/*
 * Copyright (c) 2024 Matthias Blomme and Dimitri Casier
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { EmptyDIServiceProvider } from '@domaincrafters/di/mod.ts';
import { assert, assertThrows } from '@std/assert';

interface UserService {
    user: string;
}

Deno.test('EmptyDIServiceProvider - createScope throws', () => {
    // Arrange
    const serviceCollection = EmptyDIServiceProvider.instance();

    // Act & Assert
    assertThrows(() => serviceCollection.createScope());
});

Deno.test('EmptyDIServiceProvider - getService returns empty', async () => {
    // Arrange
    const serviceCollection = EmptyDIServiceProvider.instance();

    // Act
    const serviceOptional = await serviceCollection.getService<UserService>('userService');

    // Assert
    assert(!serviceOptional.isPresent);
});

Deno.test('EmptyDIServiceProvider - dispose returns empty', async () => {
    // Arrange
    const serviceCollection = EmptyDIServiceProvider.instance();

    // Act
    await serviceCollection.dispose();

    // Assert
    assert(true);
});
