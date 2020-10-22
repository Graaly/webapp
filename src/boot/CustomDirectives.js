// VueJS custom directives

export default ({ Vue }) => {
  // detect click outside an element, from https://stackoverflow.com/a/42389266/488666
  /*Vue.directive('click-outside', {
        bind: function (el, binding, vnode) {
            el.clickOutsideEvent = function (event) {
                // here I check that click was outside the el and his childrens
                if (event.path.indexOf(el) === -1) {
                    // and if it did, call method provided in attribute value
                    vnode.context[binding.expression](event);
                }
            };
            document.body.addEventListener('click', el.clickOutsideEvent)
        },
        unbind: function (el) {
            document.body.removeEventListener('click', el.clickOutsideEvent)
        }
    });*/
};
