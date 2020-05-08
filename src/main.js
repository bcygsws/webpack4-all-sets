/* 这是js入口文件 */
/* jshint esversion: 6 */
// 初始化包配置文件命令：npm init -y
import $ from 'jquery';
import './css/index.scss';
$(function () {
    $('ul>li:even').css("backgroundColor", "red");
    $('ul>li:odd').css("backgroundColor", "hotpink");
});

// ES6语法
// 利用babel插件把ES6语法转换成ES5语法
/*
babel包含两套包：都需要安装
babel-core babel-loader babel-plugin-component babel-plugin-transform-runtime
babel-preset-env babel-preset-stage-0
*/
// class Person {
//     // 定义一个静态成员变量，就直接可以类名.变量名来调用
//     static info = { name: 'zs' };
// }
// console.log(Person.info);
