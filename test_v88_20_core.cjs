const assert=require('node:assert/strict');
const C=require('./v88_20_core.js');
function test(name,fn){try{fn();console.log('PASS',name)}catch(e){console.error('FAIL',name);throw e}}
test('I versus 1 remains distinct when exact matching',()=>{
 const p=C.proposals({article_no:'11000329'},[{id:1,article_no:'I1000329',active:1},{id:2,article_no:'11000329',active:1}]);
 assert.equal(p.exact[0].id,2);assert.equal(p.confusable[0].id,1);
});
test('I/1 and O/0 alternatives are proposed, not silently merged',()=>{
 assert(C.variants('I1000329').includes('11000329'));
 assert(C.variants('11000329').includes('I1000329'));
 assert(C.variants('BO021').includes('B0021'));
});
test('manual corrections preserve counts and old OCR metadata',()=>{
 const r={key:'4:5',article_no:'11000329',counted_stock:32,stock:8,ocr_original_no:'11000329',unit:'L',verified:false};
 const fixed=C.normalizeRow(r,{action:'corrected',article_no:'I1000329'});
 assert.equal(fixed.article_no,'I1000329');assert.equal(fixed.manual_link,true);assert.equal(fixed.counted_stock,32);assert.equal(fixed.stock,8);assert.equal(fixed.unit,'L');assert.equal(r.article_no,'11000329');
});
test('later means do not approve or change article number',()=>{
 const r={key:'3:5',article_no:'I1000401',verified:false};
 const later=C.normalizeRow(r,{action:'later'});assert.equal(later.review_v8820,'later');assert.equal(later.verified,false)
});
test('review progress counts confirmed/corrected/later/open',()=>{
 assert.deepEqual(C.reviewStats([{review_v8820:'confirmed'},{review_v8820:'corrected'},{review_v8820:'later'},{}]),{total:4,reviewed:2,later:1,open:1});
});
test('invalid manual article number rejected',()=>{
 assert.throws(()=>C.normalizeRow({article_no:'I1000329'},{action:'corrected',article_no:'🙃'}));
});
test('archive blocks inventory, stock, movement and bins',()=>{
 const article={id:1,active:1,stock:0,initial_stock:0};
 assert.equal(C.archiveEligibility(article).allowed,true);
 for(const refs of [{movements:1},{inventory_counts:1},{stock_bins:1},{service_pdf_imports:1},{other:1}])assert.equal(C.archiveEligibility(article,refs).allowed,false);
 assert.equal(C.archiveEligibility({...article,stock:1}).allowed,false);
 assert.equal(C.archiveEligibility({...article,initial_stock:1}).allowed,false);
 assert.equal(C.archiveEligibility({...article,active:0}).allowed,false);
});
test('zero amount and missing amount remain different',()=>{
 assert.equal(C.parseManualAmount(''),null);assert.equal(C.parseManualAmount('0'),0);assert.equal(C.parseManualAmount('1,25'),1.25);
});
