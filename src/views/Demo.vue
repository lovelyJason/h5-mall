<template>
  <div style="padding: 20px">
  </div>
</template>
<script setup lang="ts">
// import bgImgURL from "@/assets/images/test.jpg"
// import QRCode from 'qrcodejs2'
// import html2canvas from 'html2canvas'

// export default {
//   data() {
//     return {
//       bgImgURL: bgImgURL,
//       contentData: '我是一张分享海报', // 文案内容
//       posterImgURL: '', // 最终生成的海报图片URL
//     }
//   },
//   mounted() {
//     this.$nextTick(
//       () => {
//         this.createQrcode("https://www.baidu.com/")
//       }
//     )
//   },
//   methods: {
//     // 生成二维码
//     createQrcode(text) {
//       let qrcodeImgEl = document.getElementById('qrcodeImg')
//       qrcodeImgEl.innerHTML = ''
//       let qrcode = new QRCode(qrcodeImgEl, {
//         width: 100,
//         height: 100,
//         colorDark: '#000000',
//         colorLight: '#ffffff',
//         correctLevel: QRCode.CorrectLevel.H
//       })
//       qrcode.makeCode(text)
//     },
//     // 生成海报
//     createPoster() {
//       let that = this
//       let posterDOM = document.getElementById('posterHtml')
//       html2canvas(posterDOM, {
//         width: posterDOM.offsetWidth,
//         height: posterDOM.offsetHeight,
//         //按比例增加分辨率
//         scale: window.devicePixelRatio, // 设备像素比
//         useCORS: true,//（图片跨域相关）
//         allowTaint: true,//允许跨域（图片跨域相关）
//         logging: false,
//         letterRendering: true,
//       }).then(function (canvas) {
//         that.posterImgURL = canvas.toDataURL('image/png')
//       })
//     },
//     // 下载海报
//     downloadPoster(url, fileName) {
//       let a = document.createElement('a')
//       a.download = fileName
//       a.href = url
//       a.dispatchEvent(new MouseEvent('click'))
//     },
//   }
// }
</script>
<style scoped>
/*海报*/
.posterBox {
  position: relative;
  width: 800px;
  height: 300px;
  background-repeat: no-repeat;
  background-size: cover;
}

/*海报文案*/
.posterContent {
  text-align: center;
  color: white;
  padding: 10px;
}

/*二维码*/
.qrcodeBox {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

/*按钮*/
.myButton {
  background: none;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  margin: 10px;
}
</style>