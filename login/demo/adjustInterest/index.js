module.exports = {
  routes: [
    {
      name: 'adjustInterest-sys-list',
      path: '/adjustInterest/adjustInterest_sys_list',
      component: './src/adjustInterest_sys_list.vue'
    },
    {
      name: 'adjustInterest-hand-list',
      path: '/adjustInterest/adjustInterest_hand_list',
      component: './src/adjustInterest_hand_list.vue'
    },
    {
      name: 'adjustInterest_confirm-list',
      path: '/adjustInterest/adjustInterest_confirm_list',
      component: './src/adjustInterest_confirm.vue'
    },
    {
      name: 'adjustInterest_confirm_approval',
      path: '/adjustInterest/adjustInterest_confirm_approval/:id',
      component: './src/adjustInterest_confirm_approval.vue'
    },
    {
      name: 'adjustInterest_sys_detail',
      path: '/adjustInterest/adjustInterest_sys_detail/:id',
      component: './src/adjustInterest_sys_detail.vue'
    },
    {
      name: 'adjustInterest_sys_approval',
      path: '/adjustInterest/adjustInterest_sys_approval/:id',
      component: './src/adjustInterest_sys_approval.vue'
    },
    {
      name: 'adjustInterest_hand_detail',
      path: '/adjustInterest/adjustInterest_hand_detail/:id/:billstatus',
      component: './src/adjustInterest_hand_detail.vue'
    },
  ]
}
