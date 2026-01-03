import { describe, it, expect } from 'vitest'
import { Money, rupiah, rupiahMinor } from '../money'

describe('Money class', () => {
  describe('fromMinor', () => {
    it('should create Money from minor units (IDR)', () => {
      const money = Money.fromMinor(150000, 'IDR')
      expect(money.amount.toNumber()).toBe(150000)
      expect(money.currency).toBe('IDR')
    })

    it('should create Money from minor units (USD)', () => {
      const money = Money.fromMinor(1500, 'USD')
      expect(money.amount.toNumber()).toBe(15) // 1500 cents = $15
      expect(money.currency).toBe('USD')
    })

    it('should handle zero', () => {
      const money = Money.fromMinor(0, 'IDR')
      expect(money.amount.toNumber()).toBe(0)
      expect(money.isZero()).toBe(true)
    })

    it('should handle negative amounts', () => {
      const money = Money.fromMinor(-50000, 'IDR')
      expect(money.amount.toNumber()).toBe(-50000)
      expect(money.isNegative()).toBe(true)
    })
  })

  describe('fromMajor', () => {
    it('should create Money from major units (IDR)', () => {
      const money = Money.fromMajor(150000, 'IDR')
      expect(money.amount.toNumber()).toBe(150000)
    })

    it('should create Money from major units (USD)', () => {
      const money = Money.fromMajor(15.50, 'USD')
      expect(money.amount.toNumber()).toBe(15.50)
    })

    it('should handle string input', () => {
      const money = Money.fromMajor('1500000', 'IDR')
      expect(money.amount.toNumber()).toBe(1500000)
    })
  })

  describe('toMinor', () => {
    it('should convert IDR to minor units (no decimal)', () => {
      const money = Money.fromMajor(150000, 'IDR')
      expect(money.toMinor()).toBe(150000)
    })

    it('should convert USD to minor units (cents)', () => {
      const money = Money.fromMajor(15.50, 'USD')
      expect(money.toMinor()).toBe(1550)
    })

    it('should round half up for USD', () => {
      const money = Money.fromMajor(10.555, 'USD')
      expect(money.toMinor()).toBe(1056) // rounds up
    })

    it('should handle negative amounts correctly', () => {
      const money = Money.fromMajor(-150000, 'IDR')
      expect(money.toMinor()).toBe(-150000)
    })
  })

  describe('format', () => {
    it('should format IDR with Indonesian locale', () => {
      const money = Money.fromMajor(1500000, 'IDR')
      const formatted = money.format('id-ID')
      expect(formatted).toContain('1.500.000')
      expect(formatted).toContain('Rp')
    })

    it('should format USD with US locale', () => {
      const money = Money.fromMajor(15.50, 'USD')
      const formatted = money.format('en-US')
      expect(formatted).toBe('$15.50')
    })
  })

  describe('arithmetic operations', () => {
    it('should add two Money values', () => {
      const a = Money.fromMajor(100000, 'IDR')
      const b = Money.fromMajor(50000, 'IDR')
      const result = a.add(b)
      expect(result.amount.toNumber()).toBe(150000)
    })

    it('should subtract two Money values', () => {
      const a = Money.fromMajor(100000, 'IDR')
      const b = Money.fromMajor(30000, 'IDR')
      const result = a.subtract(b)
      expect(result.amount.toNumber()).toBe(70000)
    })

    it('should multiply Money by a factor', () => {
      const money = Money.fromMajor(10000, 'IDR')
      const result = money.multiply(5)
      expect(result.amount.toNumber()).toBe(50000)
    })

    it('should multiply Money by a decimal factor', () => {
      const money = Money.fromMajor(100000, 'IDR')
      const result = money.multiply(0.1) // 10%
      expect(result.amount.toNumber()).toBe(10000)
    })

    it('should throw when adding different currencies', () => {
      const idr = Money.fromMajor(100000, 'IDR')
      const usd = Money.fromMajor(100, 'USD')
      expect(() => idr.add(usd)).toThrow('Currency mismatch')
    })

    it('should throw when subtracting different currencies', () => {
      const idr = Money.fromMajor(100000, 'IDR')
      const usd = Money.fromMajor(100, 'USD')
      expect(() => idr.subtract(usd)).toThrow('Currency mismatch')
    })
  })

  describe('comparison operations', () => {
    it('should detect positive amounts', () => {
      const money = Money.fromMajor(100000, 'IDR')
      expect(money.isPositive()).toBe(true)
      expect(money.isNegative()).toBe(false)
      expect(money.isZero()).toBe(false)
    })

    it('should detect negative amounts', () => {
      const money = Money.fromMajor(-100000, 'IDR')
      expect(money.isPositive()).toBe(false)
      expect(money.isNegative()).toBe(true)
      expect(money.isZero()).toBe(false)
    })

    it('should detect zero', () => {
      const money = Money.fromMajor(0, 'IDR')
      expect(money.isZero()).toBe(true)
      expect(money.isPositive()).toBe(false)
      expect(money.isNegative()).toBe(false)
    })

    it('should compare greater than', () => {
      const a = Money.fromMajor(100000, 'IDR')
      const b = Money.fromMajor(50000, 'IDR')
      expect(a.greaterThan(b)).toBe(true)
      expect(b.greaterThan(a)).toBe(false)
    })

    it('should compare less than', () => {
      const a = Money.fromMajor(50000, 'IDR')
      const b = Money.fromMajor(100000, 'IDR')
      expect(a.lessThan(b)).toBe(true)
      expect(b.lessThan(a)).toBe(false)
    })

    it('should throw when comparing different currencies', () => {
      const idr = Money.fromMajor(100000, 'IDR')
      const usd = Money.fromMajor(100, 'USD')
      expect(() => idr.greaterThan(usd)).toThrow('Currency mismatch')
    })
  })
})

describe('rupiah helper', () => {
  it('should create IDR from major units', () => {
    const money = rupiah(1500000)
    expect(money.amount.toNumber()).toBe(1500000)
    expect(money.currency).toBe('IDR')
  })

  it('should handle string input', () => {
    const money = rupiah('2500000')
    expect(money.amount.toNumber()).toBe(2500000)
  })
})

describe('rupiahMinor helper', () => {
  it('should create IDR from minor units', () => {
    const money = rupiahMinor(1500000)
    expect(money.amount.toNumber()).toBe(1500000)
    expect(money.currency).toBe('IDR')
  })
})

describe('real-world scenarios', () => {
  it('should calculate invoice total correctly', () => {
    const items = [
      { qty: 10, unitPrice: rupiah(15000) },
      { qty: 5, unitPrice: rupiah(25000) },
      { qty: 2, unitPrice: rupiah(100000) },
    ]

    let total = rupiah(0)
    for (const item of items) {
      const lineTotal = item.unitPrice.multiply(item.qty)
      total = total.add(lineTotal)
    }

    expect(total.amount.toNumber()).toBe(475000) // 150000 + 125000 + 200000
  })

  it('should calculate payment allocation correctly', () => {
    const invoiceTotal = rupiah(500000)
    const payment = rupiah(350000)
    const balance = invoiceTotal.subtract(payment)

    expect(balance.amount.toNumber()).toBe(150000)
    expect(balance.isPositive()).toBe(true)
  })

  it('should calculate percentage discount correctly', () => {
    const subtotal = rupiah(1000000)
    const discountPercent = 0.1 // 10%
    const discount = subtotal.multiply(discountPercent)
    const total = subtotal.subtract(discount)

    expect(discount.amount.toNumber()).toBe(100000)
    expect(total.amount.toNumber()).toBe(900000)
  })

  it('should handle BPJS-like percentage calculations', () => {
    const salary = rupiah(5000000)
    const jkkRate = 0.0024 // 0.24%
    const jkmRate = 0.003 // 0.3%

    const jkk = salary.multiply(jkkRate)
    const jkm = salary.multiply(jkmRate)

    expect(jkk.amount.toNumber()).toBe(12000)
    expect(jkm.amount.toNumber()).toBe(15000)
  })
})
