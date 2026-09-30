/* 商品全集 S：共 6 件商品，其中 100 元与 500 元是价格区间的边界样本 */
const S = [
    { name: "冰箱", category: "家电", price: 2999, free_shipping: true, image: "images/fridge.jpg" },
    { name: "耳机", category: "家电", price: 199, free_shipping: true, image: "images/headphones.jpg" },
    { name: "T恤", category: "服装", price: 99, free_shipping: false, image: "images/tshirt.jpg" },
    { name: "饼干", category: "食品", price: 29, free_shipping: true, image: "images/cookies.jpg" },
    { name: "边界商品100", category: "服装", price: 100, free_shipping: true, image: "images/tshirt.jpg" },
    { name: "边界商品500", category: "家电", price: 500, free_shipping: true, image: "images/fridge.jpg" }
];

/* 与下拉框“全部”选项 value 保持一致的常量 */
const ALL = "全部";

/* 价格区间判定规则：key 与下拉框选项 value 一一对应
   0-100 元含 100 元；100-500 元不含 100 元、含 500 元；500 元以上不含 500 元 */
const PRICE_RANGES = {
    "0-100": price => price >= 0 && price <= 100,
    "100-500": price => price > 100 && price <= 500,
    "500以上": price => price > 500
};

/* 价格区间的边界取值，用于在商品卡片上标注 */
const PRICE_BOUNDARIES = [100, 500];

/* 把商品集合格式化成元素表，空集合显示为 ∅（空集合） */
function formatRoster(goods) {
    if (goods.length === 0) return "∅（空集合）";
    return "{ " + goods.map(item => item.name).join("、") + " }";
}

/* 一次给出“元素表 + 基数”的集合描述，例如 R = { 耳机 }｜|R| = 1 */
function describeSet(name, goods) {
    return `${name} = ${formatRoster(goods)}｜|${name}| = ${goods.length}`;
}

/* 集合描述并补上全集规模，用于筛选结果统计行 */
function formatSummary(name, goods) {
    return `${describeSet(name, goods)}（全集 |S| = ${S.length}）`;
}

function matchesPrice(priceRange, price) {
    if (priceRange === ALL) return true;
    const rule = PRICE_RANGES[priceRange];
    return rule ? rule(price) : false;
}

function matchesShipping(shipping, goods) {
    if (shipping === ALL) return true;
    return goods.free_shipping === (shipping === "是");
}

function renderGoods(goods, containerId, emptyMessage = "没有符合条件的商品") {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (goods.length === 0) {
        container.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
        return;
    }

    container.innerHTML = goods.map(product => `
        <article class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">¥${product.price}<small>元</small></p>
                <span class="product-tag">${product.category}</span>
                <span class="product-tag ${product.free_shipping ? "" : "no-shipping"}">
                    ${product.free_shipping ? "包邮" : "不包邮"}
                </span>
                ${PRICE_BOUNDARIES.includes(product.price)
                    ? '<span class="product-tag boundary-tag">区间边界价</span>'
                    : ""}
            </div>
        </article>
    `).join("");
}

/* 在下拉框每个选项后追加“（n 件）”，让用户提前看到该条件的命中数量 */
function decorateOptionCounts(selectId, matcher) {
    const select = document.getElementById(selectId);
    if (!select) return;

    Array.from(select.options).forEach(option => {
        if (!option.dataset.baseLabel) option.dataset.baseLabel = option.textContent;
        const count = S.filter(matcher(option.value)).length;
        option.textContent = `${option.dataset.baseLabel}（${count} 件）`;
    });
}

function initFilterOptions() {
    decorateOptionCounts("category", value => goods => value === ALL || goods.category === value);
    decorateOptionCounts("price", value => goods => matchesPrice(value, goods.price));
    decorateOptionCounts("shipping", value => goods => matchesShipping(value, goods));
}

/* 读取下拉框的基础文案（去掉追加的件数），用于拼接筛选表达式 */
function getOptionLabel(selectId, value) {
    const select = document.getElementById(selectId);
    const option = select ? Array.from(select.options).find(item => item.value === value) : null;
    return option ? option.dataset.baseLabel || option.textContent : value;
}

function showOriginalSet() {
    renderGoods(S, "originalSet");
}

/* 读取当前筛选条件并返回命中商品（三个条件同时成立，即三个集合的交集） */
function getFilteredGoods() {
    const category = document.getElementById("category").value;
    const price = document.getElementById("price").value;
    const shipping = document.getElementById("shipping").value;

    return S.filter(goods =>
        (category === ALL || goods.category === category) &&
        matchesPrice(price, goods.price) &&
        matchesShipping(shipping, goods)
    );
}

/* 把当前筛选条件拼成集合表达式文案 */
function describeFilterConditions() {
    const category = document.getElementById("category").value;
    const price = document.getElementById("price").value;
    const shipping = document.getElementById("shipping").value;
    const conditions = [];

    if (category !== ALL) conditions.push(`类别「${category}」`);
    if (price !== ALL) conditions.push(`价格「${getOptionLabel("price", price)}」`);
    if (shipping !== ALL) conditions.push(shipping === "是" ? "包邮" : "不包邮");

    return conditions.length ? conditions.join(" ∩ ") : "未选择筛选条件，显示全集 S";
}

function filterGoods() {
    const result = getFilteredGoods();

    document.getElementById("expression").innerText = describeFilterConditions();
    document.getElementById("resultSummary").innerText = formatSummary("R", result);
    renderGoods(result, "result");
}

/* 重置三个下拉框并立即刷新结果 */
function resetFilters() {
    document.getElementById("category").value = ALL;
    document.getElementById("price").value = ALL;
    document.getElementById("shipping").value = ALL;
    filterGoods();
}

/* 集合 A：家电商品 */
function getA() {
    return S.filter(goods => goods.category === "家电");
}

/* 集合 B：价格大于 100 元且不超过 500 元 */
function getB() {
    return S.filter(goods => goods.price > 100 && goods.price <= 500);
}

const SET_RESULT_HINT = "A 与 B 由商品全集 S 实时定义，点击任意运算后在这里显示结果与基数。";

/* 在定义区展示 A、B 当前的元素表 */
function renderSetRosters() {
    document.getElementById("rosterA").innerText = `A = ${formatRoster(getA())}`;
    document.getElementById("rosterB").innerText = `B = ${formatRoster(getB())}`;
}

function showSet(expression, result, resultName = "结果") {
    document.getElementById("setExpression").innerText = expression;
    document.getElementById("setRoster").innerText = formatSummary(resultName, result);
    renderGoods(result, "setResult", "∅（空集合）");
}

/* 并集：按全集 S 的顺序遍历，天然完成去重 */
function showUnion() {
    const A = getA();
    const B = getB();
    showSet(
        "A ∪ B = { x | x ∈ A 或 x ∈ B }",
        S.filter(goods => A.includes(goods) || B.includes(goods)),
        "A ∪ B"
    );
}

/* 交集 */
function showIntersection() {
    const A = getA();
    const B = getB();
    showSet(
        "A ∩ B = { x | x ∈ A 且 x ∈ B }",
        A.filter(goods => B.includes(goods)),
        "A ∩ B"
    );
}

/* 差集 A - B */
function showDifference() {
    const A = getA();
    const B = getB();
    showSet(
        "A - B = { x | x ∈ A 且 x ∉ B }",
        A.filter(goods => !B.includes(goods)),
        "A - B"
    );
}

/* 差集 B - A：与 A - B 方向相反 */
function showReverseDifference() {
    const A = getA();
    const B = getB();
    showSet(
        "B - A = { x | x ∈ B 且 x ∉ A }",
        B.filter(goods => !A.includes(goods)),
        "B - A"
    );
}

/* 补集：相对全集 S 的补集 */
function showComplement() {
    const A = getA();
    showSet(
        "Aᶜ = S - A = { x | x ∈ S 且 x ∉ A }",
        S.filter(goods => !A.includes(goods)),
        "Aᶜ"
    );
}

/* 对称差：只属于 A、B 其中一个集合的元素 */
function showSymmetricDifference() {
    const A = getA();
    const B = getB();
    showSet(
        "A ⊕ B = (A - B) ∪ (B - A)",
        S.filter(goods => A.includes(goods) !== B.includes(goods)),
        "A ⊕ B"
    );
}

/* 清空运算结果，回到初始提示 */
function resetSetResult() {
    document.getElementById("setExpression").innerText = "点击运算开始计算";
    document.getElementById("setRoster").innerText = SET_RESULT_HINT;
    document.getElementById("setResult").innerHTML = "";
}

/* 图片加载失败时替换为占位提示，避免出现破图 */
function handleImageError(event) {
    const target = event.target;
    if (!target || target.tagName !== "IMG") return;

    const fallback = document.createElement("span");
    fallback.className = "image-fallback";
    fallback.textContent = "图片加载失败";
    target.replaceWith(fallback);
}

function init() {
    document.getElementById("inventoryCount").textContent = S.length;
    document.getElementById("originalCount").textContent = S.length;

    initFilterOptions();
    renderSetRosters();
    document.getElementById("setRoster").innerText = SET_RESULT_HINT;

    document.getElementById("applyFilters").addEventListener("click", filterGoods);
    document.getElementById("resetFilters").addEventListener("click", resetFilters);
    ["category", "price", "shipping"].forEach(id => {
        document.getElementById(id).addEventListener("change", filterGoods);
    });

    document.getElementById("unionButton").addEventListener("click", showUnion);
    document.getElementById("intersectionButton").addEventListener("click", showIntersection);
    document.getElementById("differenceButton").addEventListener("click", showDifference);
    document.getElementById("reverseDifferenceButton").addEventListener("click", showReverseDifference);
    document.getElementById("complementButton").addEventListener("click", showComplement);
    document.getElementById("symmetricButton").addEventListener("click", showSymmetricDifference);
    document.getElementById("resetSetButton").addEventListener("click", resetSetResult);

    document.addEventListener("error", handleImageError, true);

    showOriginalSet();
    filterGoods();
}

init();