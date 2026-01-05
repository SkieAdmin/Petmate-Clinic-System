const prisma = require('../utils/prisma');

class EmployeeService {
  async generateEmployeeNumber() {
    const year = new Date().getFullYear();
    const lastEmployee = await prisma.employee.findFirst({
      where: { employeeNumber: { startsWith: `EMP-${year}` } },
      orderBy: { employeeNumber: 'desc' },
    });

    let nextNumber = 1;
    if (lastEmployee) {
      const lastNumber = parseInt(lastEmployee.employeeNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `EMP-${year}-${String(nextNumber).padStart(4, '0')}`;
  }

  async getAllEmployees(filters = {}) {
    const { status, department, search } = filters;
    const where = {};

    if (status) where.status = status;
    if (department) where.department = department;
    if (search) {
      where.OR = [
        { employeeNumber: { contains: search } },
        { position: { contains: search } },
        { user: { fullName: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    return await prisma.employee.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: { dateHired: 'desc' },
    });
  }

  async getEmployeeById(id) {
    return await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async getEmployeeByUserId(userId) {
    return await prisma.employee.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async createEmployee(data) {
    const employeeNumber = await this.generateEmployeeNumber();

    return await prisma.employee.create({
      data: {
        employeeNumber,
        dateHired: data.dateHired ? new Date(data.dateHired) : new Date(),
        position: data.position,
        department: data.department || null,
        salary: data.salary ? parseFloat(data.salary) : null,
        salaryType: data.salaryType || 'Monthly',
        sssNumber: data.sssNumber || null,
        philhealthNumber: data.philhealthNumber || null,
        pagibigNumber: data.pagibigNumber || null,
        tinNumber: data.tinNumber || null,
        emergencyContact: data.emergencyContact || null,
        emergencyPhone: data.emergencyPhone || null,
        bankAccount: data.bankAccount || null,
        bankName: data.bankName || null,
        notes: data.notes || null,
        status: data.status || 'Active',
        userId: parseInt(data.userId),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });
  }

  async updateEmployee(id, data) {
    const updateData = {};

    if (data.dateHired !== undefined) updateData.dateHired = new Date(data.dateHired);
    if (data.dateTerminated !== undefined) updateData.dateTerminated = data.dateTerminated ? new Date(data.dateTerminated) : null;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.salary !== undefined) updateData.salary = data.salary ? parseFloat(data.salary) : null;
    if (data.salaryType !== undefined) updateData.salaryType = data.salaryType;
    if (data.sssNumber !== undefined) updateData.sssNumber = data.sssNumber;
    if (data.philhealthNumber !== undefined) updateData.philhealthNumber = data.philhealthNumber;
    if (data.pagibigNumber !== undefined) updateData.pagibigNumber = data.pagibigNumber;
    if (data.tinNumber !== undefined) updateData.tinNumber = data.tinNumber;
    if (data.emergencyContact !== undefined) updateData.emergencyContact = data.emergencyContact;
    if (data.emergencyPhone !== undefined) updateData.emergencyPhone = data.emergencyPhone;
    if (data.bankAccount !== undefined) updateData.bankAccount = data.bankAccount;
    if (data.bankName !== undefined) updateData.bankName = data.bankName;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status !== undefined) updateData.status = data.status;

    return await prisma.employee.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });
  }

  async terminateEmployee(id, terminationDate) {
    return await prisma.employee.update({
      where: { id: parseInt(id) },
      data: {
        status: 'Terminated',
        dateTerminated: terminationDate ? new Date(terminationDate) : new Date(),
      },
    });
  }

  async deleteEmployee(id) {
    return await prisma.employee.delete({
      where: { id: parseInt(id) },
    });
  }

  async getDepartments() {
    return ['Administration', 'Medical', 'Front Desk', 'Laboratory', 'Grooming', 'Maintenance'];
  }

  async getEmployeeStats() {
    const [total, active, onLeave, terminated] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'Active' } }),
      prisma.employee.count({ where: { status: 'On Leave' } }),
      prisma.employee.count({ where: { status: 'Terminated' } }),
    ]);

    return {
      total: Number(total),
      active: Number(active),
      onLeave: Number(onLeave),
      terminated: Number(terminated),
    };
  }
}

module.exports = new EmployeeService();
