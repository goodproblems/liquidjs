import * as chai from 'chai'
import { toThenable } from '../../../src/util/async'
import { FilterMap } from '../../../src/template/filter/filter-map'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import { Context } from '../../../src/context/context'
import { Value } from '../../../src/template/value'

chai.use(sinonChai)

const expect = chai.expect

describe('Value', function () {
  describe('#constructor()', function () {
    const filterMap = new FilterMap(false)
    it('should parse "foo', function () {
      const tpl = new Value('foo', filterMap)
      expect(tpl.initial).to.equal('foo')
      expect(tpl.filters).to.deep.equal([])
    })

    it('should parse "foo | add"', function () {
      const tpl = new Value('foo | add', filterMap)
      expect(tpl.initial).to.equal('foo')
      expect(tpl.filters.length).to.equal(1)
      expect(tpl.filters[0].args).to.eql([])
    })
    it('should parse "foo,foo | add"', function () {
      const tpl = new Value('foo,foo | add', filterMap)
      expect(tpl.initial).to.equal('foo')
      expect(tpl.filters.length).to.equal(1)
      expect(tpl.filters[0].args).to.eql([])
    })
    it('should parse "foo | add: 3, false"', function () {
      const tpl = new Value('foo | add: 3, "foo"', filterMap)
      expect(tpl.initial).to.equal('foo')
      expect(tpl.filters.length).to.equal(1)
      expect(tpl.filters[0].args).to.eql(['3', '"foo"'])
    })
    it('should parse "foo | add: "foo" bar, 3"', function () {
      const tpl = new Value('foo | add: "foo" bar, 3', filterMap)
      expect(tpl.initial).to.equal('foo')
      expect(tpl.filters.length).to.equal(1)
      expect(tpl.filters[0].name).to.eql('add')
      expect(tpl.filters[0].args).to.eql(['"foo"', '3'])
    })
    it('should parse "foo | add: "|", 3', function () {
      const tpl = new Value('foo | add: "|", 3', filterMap)
      expect(tpl.initial).to.equal('foo')
      expect(tpl.filters.length).to.equal(1)
      expect(tpl.filters[0].args).to.eql(['"|"', '3'])
    })
    it('should parse "foo | add: "|", 3', function () {
      const tpl = new Value('foo | add: "|", 3', filterMap)
      expect(tpl.initial).to.equal('foo')
      expect(tpl.filters.length).to.equal(1)
      expect(tpl.filters[0].args).to.eql(['"|"', '3'])
    })
    it('should support arguments as named key/values', function () {
      const f = new Value('o | foo: key1: "literal1", key2: value2', filterMap)
      expect(f.filters[0].name).to.equal('foo')
      expect(f.filters[0].args).to.eql([['key1', '"literal1"'], ['key2', 'value2']])
    })
    it('should support arguments as named key/values with inline literals', function () {
      const f = new Value('o | foo: "test0", key1: "literal1", key2: value2', filterMap)
      expect(f.filters[0].name).to.equal('foo')
      expect(f.filters[0].args).to.deep.equal(['"test0"', ['key1', '"literal1"'], ['key2', 'value2']])
    })
    it('should support arguments as named key/values with inline values', function () {
      const f = new Value('o | foo: test0, key1: "literal1", key2: value2', filterMap)
      expect(f.filters[0].name).to.equal('foo')
      expect(f.filters[0].args).to.deep.equal(['test0', ['key1', '"literal1"'], ['key2', 'value2']])
    })
    it('should support argument values named same as keys', function () {
      const f = new Value('o | foo: a: a', filterMap)
      expect(f.filters[0].name).to.equal('foo')
      expect(f.filters[0].args).to.deep.equal([['a', 'a']])
    })
    it('should support argument literals named same as keys', function () {
      const f = new Value('o | foo: a: "a"', filterMap)
      expect(f.filters[0].name).to.equal('foo')
      expect(f.filters[0].args).to.deep.equal([['a', '"a"']])
    })
  })

  describe('#value()', function () {
    it('should call chained filters correctly', async function () {
      const date = sinon.stub().returns('y')
      const time = sinon.spy()
      const filterMap = new FilterMap(false)
      filterMap.set('date', date)
      filterMap.set('time', time)
      const tpl = new Value('foo.bar | date: "b" | time:2', filterMap)
      const scope = new Context({
        foo: { bar: 'bar' }
      })
      await toThenable(tpl.value(scope))
      expect(date).to.have.been.calledWith('bar', 'b')
      expect(time).to.have.been.calledWith('y', 2)
    })
  })
})
