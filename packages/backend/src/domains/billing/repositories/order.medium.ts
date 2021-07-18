import { orderRepo } from './order';
import { orm } from '../../../lib/orm';

import { Customer, Product, Shop } from '../../shop/models';
import { shopRepo } from '../../shop/repositories';

import { generate } from '../../../../test/data';

describe('orderRepo', () => {
  afterAll(async () => {
    await orm.close();
  });

  describe('create', () => {
    test('should create a order', async () => {
      await orm.runAndRevert(async em => {
        const { product, customer } = await setupTest();
        const orderInput = generate.order();
        const lineItemInput = generate.lineItem();
        const order = orderRepo.create({
          ...orderInput,
          customer,
          lineItems: [
            {
              ...lineItemInput,
              product,
            },
          ],
        });

        await em.flush();

        expect(order).toMatchObject(orderInput);
        expect(order.lineItems.toJSON()).toContainEqual(
          expect.objectContaining({
            ...lineItemInput,
            product: product.id,
            order: order.id,
          })
        );
      });
    });
  });

  describe('findById', () => {
    test('should find a order by id', async () => {
      await orm.runAndRevert(async em => {
        const { product, customer } = await setupTest();
        const orderInput = generate.order();
        const lineItemInput = generate.lineItem();
        const order = orderRepo.create({
          ...orderInput,
          customer,
          lineItems: [
            {
              ...lineItemInput,
              product,
            },
          ],
        });

        await em.flush();

        const found = await orderRepo.findById(order.id);
        expect(found).toMatchObject(order);
      });
    });
  });

  describe('findByNumber', () => {
    test('should find a order by number', async () => {
      await orm.runAndRevert(async em => {
        const { product, customer } = await setupTest();

        const orderInput = generate.order();
        const lineItemInput = generate.lineItem();
        const order = orderRepo.create({
          ...orderInput,
          customer,
          lineItems: [
            {
              ...lineItemInput,
              product,
            },
          ],
        });

        await em.flush();

        const found = await orderRepo.findByNumber(order.number);
        expect(found).toMatchObject(order);
      });
    });
  });

  describe('update', () => {
    test('should update the order notes and shipped at', async () => {
      await orm.runAndRevert(async em => {
        const { product, customer } = await setupTest();
        const orderInput = generate.order();
        const lineItemInput = generate.lineItem();
        const orderUpdates = generate.order();

        const order = orderRepo.create({
          ...orderInput,
          customer,
          lineItems: [
            {
              ...lineItemInput,
              product,
            },
          ],
        });

        await em.flush();

        const updated = await orderRepo.update(order.id, {
          tax: orderUpdates.tax,
        });

        await em.flush();

        expect(updated).toMatchObject({
          ...orderInput,
          tax: orderUpdates.tax,
        });
      });
    });
  });
});

interface SetupTestReturn {
  shop: Shop;
  customer: Customer;
  product: Product;
}

export async function setupTest(): Promise<SetupTestReturn> {
  const shop = await shopRepo.create({
    ...generate.shop(),
    customers: [
      generate.user(),
      generate.user(),
      generate.user(),
      generate.user(),
    ],
    products: [
      generate.product(),
      generate.product(),
      generate.product(),
      generate.product(),
    ],
  });

  return {
    shop,
    customer: shop.customers[0],
    product: shop.products[0],
  };
}
