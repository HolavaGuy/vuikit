import { once } from 'vuikit/src/_core/utils/event'
import { css } from 'vuikit/src/_core/utils/style'
import { win, docEl } from 'vuikit/src/_core/utils/env'
import { width, height } from 'vuikit/src/_core/utils/dimensions'
import { addClass, removeClass } from 'vuikit/src/_core/utils/class'

import Offcanvas from './offcanvas'
import { VkOffcanvasEl, VkOffcanvasElBar } from '../elements'

import { SHOW, SHOWN, HIDE, HIDDEN } from '../constants'

export default {
  extends: Offcanvas,
  data: () => ({
    open: false
  }),
  render (h) {
    const instance = this

    // null the inherit class, use it on the bar el instead
    const inheritClass = this.$vnode.data.staticClass
    delete this.$vnode.data.staticClass

    const content = h(VkOffcanvasEl, {
      props: this.$props,
      class: {
        'uk-open': this.open
      },
      directives: [{
        name: 'show',
        value: this.show
      }]
    }, [
      h('div', {
        ref: 'reveal',
        class: 'uk-offcanvas-reveal'
      }, [
        h(VkOffcanvasElBar, {
          ref: 'bar',
          props: { animated: true },
          class: [inheritClass, 'uk-offcanvas-slide']
        }, this.$slots.default)
      ])
    ])

    return h('transition', {
      props: { css: false },
      on: {
        beforeEnter (el) {
          instance.$emit(SHOW)

          const scrollbarWidth = instance.getScrollbarWidth()

          css(docEl, 'overflowY', instance.flipped && scrollbarWidth && instance.overlay
            ? 'scroll'
            : ''
          )

          // freeze content width/height
          width(instance.$refs.content, width(win) - scrollbarWidth)
        },
        enter (el, done) {
          height(el) // force reflow
          instance.open = true
          addClass(instance.$refs.content, 'uk-offcanvas-content-animation')

          // indicate end of transition
          once(el, 'transitionend', done, false, e => e.target === instance.$refs.reveal)
        },
        afterEnter (el) {
          instance.$emit(SHOWN)
        },
        beforeLeave (el) {
          instance.$emit(HIDE)
          instance.open = false
          removeClass(instance.$refs.content, 'uk-offcanvas-content-animation')
        },
        leave (el, done) {
          // indicate end of transition
          once(el, 'transitionend', done, false, e => e.target === instance.$refs.reveal)
        },
        afterLeave (el) {
          instance.$emit(HIDDEN)
        }
      }
    }, [ content ])
  }
}