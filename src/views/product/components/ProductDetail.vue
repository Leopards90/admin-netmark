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
              <MDinput v-model="postForm.productName" :maxlength="100" name="name" required>
                Product Name
              </MDinput>
            </el-form-item>

            <div class="postInfo-container">
              <el-row>
              </el-row>
            </div>
          </el-col>
        </el-row>

        <el-form-item style="margin-bottom: 40px;" label-width="120px" label="Type:">
          <el-select v-model="postForm.typeCategory" placeholder="Type" clearable class="filter-item" style="width: 130px">
            <el-option v-for="item in typeList" :key="item.key" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item v-show="postForm.typeCategory == 'PRODUCT'" style="margin-bottom: 40px;" label-width="120px" label="Product Code:">
          <el-input v-model="postForm.productCode" :rows="1" type="text" class="article-textarea" autosize placeholder="Please enter the content" />
        </el-form-item>

        <el-form-item style="margin-bottom: 40px;" label-width="120px" label="Category:">
          <el-select v-model="picked_category" placeholder="Category" clearable class="filter-item" style="width: 130px">
            <el-option v-for="item in category" :key="item.key" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item style="margin-bottom: 40px;" label-width="120px" label="Sub Category 1:" v-if="sub1.length > 0 && picked_category">
          <el-select v-model="picked_sub1" placeholder="Sub Category 1" clearable class="filter-item" style="width: 130px">
            <el-option v-for="item in sub1" :key="item.key" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item style="margin-bottom: 40px;" label-width="120px" label="Sub Category 2:" v-if="sub2.length > 0 && picked_sub1">
          <el-select v-model="picked_sub2" placeholder="Sub Category 2" clearable class="filter-item" style="width: 130px">
            <el-option v-for="item in sub2" :key="item.key" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item style="margin-bottom: 40px;" label-width="120px" label="Best Sales:">
          <el-switch v-model="postForm.bestSale" />
        </el-form-item>

        <!--<el-form-item v-for="image in postForm.images" prop="image_uri" style="margin-bottom: 30px;" label-width="100px"  label="Images:">-->
          <!--<Upload v-if="image && image.desktop" v-model="image.desktop"/>-->
        <!--</el-form-item>-->



        <el-form-item style="margin-bottom: 30px;" label-width="120px"  label="Images:">
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
                  <img width="150" v-bind:src="f" class="thumbnail img-responsive">
                </div>
              </li>
            </ul>
            <button class="btn btn-link add-image" @click.prevent="addNewImage">Add Image</button>
          </div>
        </el-form-item>


        <el-form-item style="margin-bottom: 40px;" label-width="120px" label="Description:">
          <el-input v-model="postForm.description" :rows="1" type="textarea" class="article-textarea" autosize placeholder="Please enter the content" />
        </el-form-item>

        <el-form-item prop="content" label-width="120px" style="margin-bottom: 30px;" label="Content:">
          <jodit-vue v-model="content"/>
        </el-form-item>
        <el-form-item v-show="postForm.typeCategory == 'PRODUCT'"
                      prop="subContent"
                      label-width="100px"
                      style="margin-bottom: 30px;"
                      label="Sub Content:">
          <jodit-vue v-model="subContent"/>
          <!--<el-input v-model="postForm.subContent" :rows="1" type="textarea" class="article-textarea" autosize placeholder="Please enter the sub content" />-->
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
import { fetchProduct , UpdateProduct , uploadImage , insertProduct , getCategory} from '@/api/product'
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
    this.getCategory()
    // if (this.isEdit) {
    //   const id = this.$route.params && this.$route.params.id
    //   // this.getCategory().then(response => {
    //   //   if(response)
    //   //     this.fetchData(id)
    //   // })
    //
    // }else{
    //   this.getCategory()
    // }
    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
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
          '<img width="150" src="' + r.result + '" class="thumbnail img-responsive">'
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
      fetchProduct(params).then(response => {
        this.postForm = response.data
        this.postForm.images = this.getProductImage(response.data.images)
        this.subContent = this.postForm.subContent
        // this.postForm.pdf = this.getLinkPDF(this.postForm.pdf)
        if(this.category.length > 0)
          this.fetchCategory(this.postForm.keyMapCategry)

        // just for test
        this.postForm.title += `   Product Id:${this.postForm.id}`
        this.postForm.content_short += `   Product Id:${this.postForm.id}`
        this.content = this.postForm.content
        this.$forceUpdate()
        // set tagsview title
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
          this.postForm.images = null
          this.postForm.content = btoa(unescape(encodeURIComponent(this.content)))
          this.postForm.subContent = btoa(unescape(encodeURIComponent(this.subContent)))
          this.postForm.keyMapCategry = []
          let keymap = {}
          if (this.picked_category) {
            keymap = {id: this.picked_category}
            this.postForm.keyMapCategry.push(keymap)
          }
          if (this.picked_sub1) {
            keymap = {id: this.picked_sub1}
            this.postForm.keyMapCategry.push(keymap)
          }
          if (this.picked_sub2) {
            keymap = {id: this.picked_sub2}
            this.postForm.keyMapCategry.push(keymap)
          }
          this.postForm.keyMapCategry = JSON.stringify(this.postForm.keyMapCategry)

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
            UpdateProduct(this.postForm).then(response => {
              vm.$notify({
                title: 'Success',
                message: vm.isEdit ? 'Edit Successfully!' : 'Create Successfully',
                type: 'success',
                duration: 2000
              })
              vm.$router.push({'name': 'Product'})
            }).catch(err => {
              this.postForm.content = atob(this.postForm.content)
            })
            if (images.length > 0 && this.postForm.id) {
              data.append('id', this.postForm.id);
              vm.axios.apiUpload.uploadProductImages(data, config, function (response) {
              })
              // this.postForm.status = 'published'
            }
            this.loading = false
          } else {
            insertProduct(this.postForm).then(response => {
              vm.$notify({
                title: 'Success',
                message: vm.isEdit ? 'Edit Successfully!' : 'Create Successfully',
                type: 'success',
                duration: 2000
              })
              if (images.length > 0 && response.data) {
                data.append('id', response.data);
                vm.axios.apiUpload.uploadProductImages(data, config, function (response) {
                })
              }
              vm.$router.push({'name': 'Product'})
            })
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
