function multiplication(a,b,c) {
    var a_v=document.getElementById(a).value;
    var b_v=document.getElementById(b).value;
    var sum=a_v*b_v;
    var settings=document.getElementById(c);
    // 判断乘数a和b是否为空或者输入非数字值
    if ((a_v=="" || isNaN(a_v)) || (b_v=="" || isNaN(b_v))) {
        settings.value = null;
        alert("输入数据有误，请重新输入！!")
    }
    else {
        settings.value = sum;
    }
}