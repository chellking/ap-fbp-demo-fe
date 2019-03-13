module.exports = {
    routes: [
      {
        name: 'listView',
        path: '/course',
        component: './src/a.vue'
      },
      {
        name: 'courseAdd',
        path: '/course/add',
        component: './src/courseAdd.vue'
      },
      {
        name: 'detailAdd',
        path: '/course/add/detailadd/:id',
        component: './src/detailAdd.vue'
      }
    
    ]
  };