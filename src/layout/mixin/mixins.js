export default {
  methods: {
    getProductImage(str) {
      if(!str) { return [] }
      let image = JSON.parse(str)
      var vm = this
      let arr = []
      if(image.length > 0) {
        for(let i of image){
          let imgDesktop = i.desktop ?  vm.$const.URL_HOST_IMG + i.desktop : ''
          let imgMobile = i.mobile ? vm.$const.URL_HOST_IMG + i.mobile : ''
          // this.$set(i, 'desktop', imgDesktop)
          // this.$set(i, 'mobile', imgMobile)
          arr.push(imgDesktop)
        }
      }
      return arr
    },
    getLinkPDF(str) {
      return this.$const.URL_HOST_IMG + str
    }
  }
}
