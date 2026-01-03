import Decimal from 'decimal.js'

Decimal.set({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
})

export type Currency = 'IDR' | 'USD'

const SCALE: Record<Currency, number> = {
  IDR: 0,
  USD: 2,
}

export class Money {
  readonly amount: Decimal
  readonly currency: Currency

  private constructor(amount: Decimal, currency: Currency) {
    this.amount = amount
    this.currency = currency
  }

  static fromMinor(minor: number | string | Decimal, currency: Currency) {
    const scale = SCALE[currency]
    const decimal = new Decimal(minor).dividedBy(new Decimal(10).pow(scale))
    return new Money(decimal, currency)
  }

  static fromMajor(major: number | string | Decimal, currency: Currency) {
    const value = new Decimal(major)
    return new Money(value, currency)
  }

  toMinor() {
    const scale = SCALE[this.currency]
    const factor = new Decimal(10).pow(scale)
    const scaled = this.amount.mul(factor)
    const isNegative = scaled.isNegative()
    const absolute = scaled.abs()
    const whole = absolute.floor()
    const fractional = absolute.minus(whole)
    const shouldRoundUp = fractional.gte(0.5)
    const rounded = shouldRoundUp ? whole.plus(1) : whole
    const signed = isNegative ? rounded.mul(-1) : rounded
    return signed.toNumber()
  }

  format(locale = 'id-ID') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: SCALE[this.currency],
      maximumFractionDigits: SCALE[this.currency],
    }).format(this.amount.toNumber())
  }

  multiply(multiplier: number | string | Decimal) {
    return new Money(this.amount.mul(multiplier), this.currency)
  }

  add(other: Money) {
    this.assertSameCurrency(other)
    return new Money(this.amount.add(other.amount), this.currency)
  }

  subtract(other: Money) {
    this.assertSameCurrency(other)
    return new Money(this.amount.sub(other.amount), this.currency)
  }

  isZero() {
    return this.amount.isZero()
  }

  isPositive() {
    return this.amount.greaterThan(0)
  }

  isNegative() {
    return this.amount.lessThan(0)
  }

  greaterThan(other: Money) {
    this.assertSameCurrency(other)
    return this.amount.greaterThan(other.amount)
  }

  lessThan(other: Money) {
    this.assertSameCurrency(other)
    return this.amount.lessThan(other.amount)
  }

  private assertSameCurrency(other: Money) {
    if (this.currency !== other.currency) {
      throw new Error('Currency mismatch')
    }
  }
}

export function rupiah(value: number | string | Decimal) {
  return Money.fromMajor(value, 'IDR')
}

export function rupiahMinor(minor: number | string | Decimal) {
  return Money.fromMinor(minor, 'IDR')
}
