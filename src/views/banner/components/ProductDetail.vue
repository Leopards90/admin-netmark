<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container"
             method="POST" enctype="multipart/form-data" v-on:submit.prevent="submitForm($event);">
      <sticky :z-index="10" :class-name="'sub-navbar'">
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">
          Save
        </el-button>
      </sticky>
      <div class="createPost-main-container">
        <el-row>
          <el-col :span="24">
            <el-form-item style="margin-bottom: 40px;" prop="title">
              <MDinput v-model="postForm.name" :maxlength="100" name="name" required>
                Name
              </MDinput>
            </el-form-item>

            <el-form-item style="margin-bottom: 40px;" label-width="100px" label="Sequence:">
              <el-input v-model="postForm.sequence" :rows="1" type="number" class="article-textarea" autosize placeholder="Please the number" />
            </el-form-item>

            <div class="postInfo-container">
              <el-row>
              </el-row>
            </div>
          </el-col>
        </el-row>
        <el-form-item style="margin-bottom: 30px;" label-width="100px"  label="Images:">
          <div class="col-md-4">
            <ul class="list-group" :if="postForm.images && postForm.images.length">
              <li class="list-group-item" v-for="(f, index) in postForm.images" :key="index">
                <div class="button success expand radius">
                  <label class="custom-file-upload">
                    <input type="file" class="images[]" accept="image/*" @change="previewImage(index, $event)">
                  </label>
                  <button class="close" @click.prevent="removeImage(index, $event)">&times;</button>
                </div>
                <div :class="'images[' + index + ']-preview image-preview'">
                  <img width="800" height="300" v-bind:src="f" class="thumbnail img-responsive">
                </div>
              </li>
            </ul>
            <!--<button class="btn btn-link add-image" @click.prevent="addNewImage">Add Image</button>-->
          </div>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
global.jQuery = require('jquery');
var $ = global.jQuery;
window.$ = $;
import Upload from '@/components/Upload/SingleImage3'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky'
import { validURL } from '@/utils/validate'
import { fetchList,addBanner,fetchBanner,updateBanner } from '@/api/banner'
import { searchUser } from '@/api/remote-search'
import Warning from './Warning'
import { CommentDropdown, PlatformDropdown, SourceUrlDropdown } from './Dropdown'
import 'jodit/build/jodit.min.css'
import JoditVue from 'jodit-vue'

const defaultForm = {
  // content: '',
  // content_short: '',
  // source_uri: '',
  // image_uri: '',
  // display_time: undefined,
  // id: undefined,
  // platforms: ['a-platform'],
  // comment_disabled: false,
  // importance: 0
}

export default {
  name: 'ProductDetail',
  components: {MDinput, Upload, Sticky, Warning, CommentDropdown, PlatformDropdown, SourceUrlDropdown ,JoditVue },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + 'Required',
          type: 'error'
        })
        callback(new Error(rule.field + 'Required'))
      } else {
        callback()
      }

    }
    const validateSourceUri = (rule, value, callback) => {
      if (value) {
        if (validURL(value)) {
          callback()
        } else {
          this.$message({
            message: 'invalid URL',
            type: 'error'
          })
          callback(new Error('invalid URL'))
        }
      } else {
        callback()
      }
    }
    return {
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      rules: {
        source_uri: [{ validator: validateSourceUri, trigger: 'blur' }]
      },
      tempRoute: {},
      typeList : ['PRODUCT','EVENT'],
      category : [],
      sub1 : [],
      sub2 : [],
      picked_category : '',
      picked_sub1 : '',
      picked_sub2 : '',
      file : '',
      config: {
        events: {
          'froalaEditor.initialized': function () {
            console.log('initialized')
          }
        },
        toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'color', 'inlineStyle', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', '|', 'emoticons', 'specialCharacters', 'insertHR', 'selectAll', 'clearFormatting', '|', 'print', 'help', 'html', '|', 'undo', 'redo']
      },
      content : '',
      addImage: 'button.add-image',
      subContent : ''
    }
  },
  computed: {
    contentShortLength() {
      return this.postForm.content_short.length
    },
    displayTime: {
      // set and get is useful when the data
      // returned by the back end api is different from the front end
      // back end return => "2013-06-25 06:59:25"
      // front end need timestamp => 1372114765000
      get() {
        return (+new Date(this.postForm.display_time))
      },
      set(val) {
        this.postForm.display_time = new Date(val)
      }
    }
  },
  watch : {
    picked_category : function(newvalue,oldvalue){
      if(newvalue){
        this.sub1 = this.findCategoryByID(this.category,newvalue).subCategories && this.findCategoryByID(this.category,newvalue).subCategories.length > 0  ? this.findCategoryByID(this.category,newvalue).subCategories : []
      }
      else{
        this.sub1 = []
        this.sub2 = []
      }
    },
    picked_sub1 : function(newvalue,oldvalue){
      if(newvalue)
      {
        this.sub2 = this.findCategoryByID(this.category,newvalue).subCategories && this.findCategoryByID(this.category,newvalue).subCategories.length > 0 ? this.findCategoryByID(this.category,newvalue).subCategories : []
      }
      else{
        this.sub2 = []
      }
    },
  },
  created() {

    if(this.isEdit){
      this.fetchData(this.$route.params.id)
    }
    else{
      this.genFirstImage()
    }
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    genFirstImage(){
      let images = []
      images.push('')
      this.postForm.images = images
      this.$forceUpdate()
    },
    removeImage: function(index) {
      this.postForm.images.splice(index, 1);
      this.$forceUpdate()
      // this.checkImages();
    },
    checkImages: function() {
      var n = this.maxImages || -1;
      if (n && this.images.length >= n) {
        $(this.addImage, this.el).prop('disabled', true);  // Disables the button.
      } else {
        $(this.addImage, this.el).prop('disabled', false); // Enables the button.
      }
    },
    previewImage: function(index, e) {
      let vm = this
      var r = new FileReader(),
        f = e.target.files[0];

      r.addEventListener('load', function() {
        $('[class~="images[' + index + ']-preview"]', this.el).html(
          '<img width="800" height="300" src="' + r.result + '" class="thumbnail img-responsive">'
        );
      }, false);

      if (f) {
        r.readAsDataURL(f);
      }
    },
    handleFileUpload(){
      this.file = this.$refs.file.files[0];
    },
    submitFile(){
      /*
              Initialize the form data
          */
      let formData = new FormData();
      /*
          Add the form data we need to submit
      */
      formData.append('file', this.file);
    },
    findCategoryByID (category,id) {
      for(let c of category){
        if(c.id == id){
          return c;
        }else{
          if(c.subCategories == null || c.subCategories.length <= 0){
            continue;
          }
          for(let s of c.subCategories){
            if(s.id == id) {
              return s;
            }else{
              if(s.subCategories == null || s.subCategories.length <= 0){
                continue;
              }
              for(let s2 of s.subCategories){
                if(s2.id == id){
                  return s2;
                }
              }
            }
          }
        }
      }
    },
    fetchData(id) {
      let params = {id : id}
      var vm = this
      fetchBanner(params).then(response => {
        this.postForm = response.data
        this.postForm.images = this.getProductImage(response.data.images)
        this.setTagsViewTitle()

        // set page title
        this.setPageTitle()
      }).catch(err => {
        console.log(err)
      })
    },
    getCategory(){
      getCategory().then(response => {
        this.category = response.data
        if(this.isEdit){
          this.fetchData(this.$route.params.id)
        }
      }).catch(err =>{
        console.log(err)
      })
    },
    fetchCategory(key){
      let arrKey = JSON.parse(key)
      if(arrKey.length > 0){
        for(let i in arrKey){
          switch(i){
            case '0' :
              this.picked_category = arrKey[i].id
              break;
            case '1' :
              this.picked_sub1 = arrKey[i].id
              break;
            case '2' :
              this.picked_sub2 = arrKey[i].id
              break;
          }
        }
      }
    },
    setTagsViewTitle() {
      const title = 'Edit Product'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.postForm.id}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = 'Edit Product'
      document.title = `${title} - ${this.postForm.id}`
    },
    addNewImage: function(e) {
      if (this.postForm.images && this.postForm.images.length > 0) {
        this.postForm.images.push('');
      }else{
        let images = []
        images.push('')
        this.postForm.images = images
        this.$forceUpdate()
      }
      // this.checkImages();
    },
    submitForm(e) {
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          var images = this.postForm.images || []
          var vm = this
          let config = {headers: {'Content-Type': 'multipart/form-data'}}
          if (images.length > 0) {
            var data = new FormData();
            $('[class~="images[]"]', this.el).each(function (i) {
              if (this.files[0]) {
                data.append('lstImg[' + i + '].type', 'DESKTOP');
                data.append('lstImg[' + i + '].seq', i);
                data.append('lstImg[' + i + '].file', this.files[0]);
              }
            });
            data.append('update', this.isEdit);
          }

          if (this.isEdit) {
            this.postForm.images = null
            updateBanner(this.postForm).then(response => {
              vm.$notify({
                title: 'Success',
                message: vm.isEdit ? 'Edit Successfully!' : 'Create Successfully',
                type: 'success',
                duration: 2000
              })
              vm.$router.push({'name': 'Banner'})
            }).catch(err => {
            })
            if (images.length > 0 && this.postForm.id) {
              data.append('id', this.postForm.id);
              vm.axios.apiUpload.uploadBannerImages(data, config, function (response) {
              })
              vm.$router.push({'name': 'Banner'})
            }
            this.loading = false
          } else {
            this.postForm.images = null
            addBanner(this.postForm).then(response => {
              vm.$notify({
                title: 'Success',
                message: vm.isEdit ? 'Edit Successfully!' : 'Create Successfully',
                type: 'success',
                duration: 2000
              })
              data.append('id', response.data);
              if(response.data){
                vm.axios.apiUpload.uploadBannerImages(data, config, function (response) {
                })
              }
            })
            vm.$router.push({'name': 'Banner'})
            this.loading = false
          }
        }else {
            console.log('error submit!!')
            return false
        }
      })
    },
    draftForm() {
      if (this.postForm.content.length === 0 || this.postForm.title.length === 0) {
        this.$message({
          message: 'Plese fill all data',
          type: 'warning'
        })
        return
      }
      this.$message({
        message: 'Saved!',
        type: 'success',
        showClose: true,
        duration: 1000
      })
      this.postForm.status = 'draft'
    },
    getRemoteUserList(query) {
      searchUser(query).then(response => {
        if (!response.data.items) return
        this.userListOptions = response.data.items.map(v => v.name)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.article-textarea /deep/ {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}
</style>
