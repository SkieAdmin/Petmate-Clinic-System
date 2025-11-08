const prisma = require('../utils/prisma');

class ItemService {
  // Get all items with optional search and filter
  async getAllItems(searchTerm = '', lowStockOnly = false) {
    const where = {};

    // Search filter
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Low stock filter
    if (lowStockOnly) {
      where.quantity = {
        lte: prisma.raw('minQuantity'),
      };
    }

    return await prisma.item.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  // Get items with low stock (quantity <= minQuantity)
  async getLowStockItems() {
    return await prisma.$queryRaw`
      SELECT * FROM items
      WHERE quantity <= minQuantity
      ORDER BY name ASC
    `;
  }

  // Get item by ID
  async getItemById(id) {
    return await prisma.item.findUnique({
      where: { id: parseInt(id) },
    });
  }

  // Create new item
  async createItem(data) {
    return await prisma.item.create({
      data: {
        name: data.name,
        description: data.description || null,
        itemType: data.itemType || 'Product',
        quantity: parseInt(data.quantity) || 0,
        minQuantity: parseInt(data.minQuantity) || 5,
        price: parseFloat(data.price),
      },
    });
  }

  // Update item
  async updateItem(id, data) {
    return await prisma.item.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        description: data.description || null,
        itemType: data.itemType,
        quantity: data.quantity !== undefined ? parseInt(data.quantity) : undefined,
        minQuantity: data.minQuantity !== undefined ? parseInt(data.minQuantity) : undefined,
        price: data.price !== undefined ? parseFloat(data.price) : undefined,
      },
    });
  }

  // Update item quantity (for inventory management)
  async updateItemQuantity(id, quantityChange) {
    const item = await prisma.item.findUnique({
      where: { id: parseInt(id) },
    });

    if (!item) {
      throw new Error('Item not found');
    }

    return await prisma.item.update({
      where: { id: parseInt(id) },
      data: {
        quantity: item.quantity + quantityChange,
      },
    });
  }

  // Delete item
  async deleteItem(id) {
    return await prisma.item.delete({
      where: { id: parseInt(id) },
    });
  }

  // Get item count
  async getItemCount() {
    const count = await prisma.item.count();
    return Number(count);
  }

  // Get low stock count
  async getLowStockCount() {
    const result = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM items
      WHERE quantity <= minQuantity
    `;
    return Number(result[0].count);
  }
}

module.exports = new ItemService();
