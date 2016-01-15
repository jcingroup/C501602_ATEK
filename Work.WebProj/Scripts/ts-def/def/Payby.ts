const enum PaybyType {
    Cash = 1,//付現
    ATM = 2,//atm轉帳
    CashOnDelivery = 3//貨到付款
}
const enum PurchasePickupState {
    online = 0, //現場取貨
    delivery = 1,//宅配
    getBySelf = 2//自行取貨
}
const enum SourceType {
    onSite = 1,//現場
    online = 2 //網路訂購
}
const enum PurchaseStateType {
    onSite = 0,//現場付款
    waitForPayment = 1,//待繳款
    waitForPaymentCheckout = 2,//待對帳確認
    waitForShip = 3,//匯款完畢待出貨通知
    complete = 4//訂單完成
}
const enum PaymentReplyType {
    notCheck = 0,//未核對
    correct = 1,//核對正確
    error = -1//核對錯誤
}
//消費紀錄檢視
const enum PurchaseViewType {
    self = 1,//個人消費紀錄
    share = 2,//共享圈消費紀錄
    member = 3,//直推會員消費紀錄
    manager = 4,//直推經理人消費紀錄
    center = 5//間接推薦會員消費紀錄
}
const enum SalesRankType {
    notSet = 0,//未設定
    general = 1,//一般會員
    manager = 2,//經理人
    operationsCenter = 3,//營運中心
    managementOffice = 4//大廈管理處
}
const enum SalesRiseRankType {
    generalToManager = 1,//一般會員->經理人
    managerToOperationsCenter = 2,//經理人->營運中心
    operationsCenterToManagerOffice = 3//營運中心->管理處
}
const enum BanngerType {
    banner = 1,//banner圖
    firm = 2//廠商圖
}
//區分產品資料設定種類
const enum ProductSetType {
    hot = 1,
    top = 2
}
const enum SettleState {
    progress = 1,//結算中
    complete = 2//結算完成
}