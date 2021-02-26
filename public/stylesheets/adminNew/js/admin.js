var url = 'https://firebasestorage.googleapis.com/v0/b/e-book-app-e4ef1.appspot.com/o/05180000116.pdf?alt=media&token=98968b67-316e-409d-b835-a74fc1556956';

var pdfjsLib = window['pdfjs-dist/build/pdf'];

pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.25,
    canvas = document.getElementById('pdf-render'),
    ctx = canvas.getContext('2d');


function renderPage(num) {
  pageRendering = true;

  pdfDoc.getPage(num).then(function(page) {
    var viewport = page.getViewport({scale: scale});
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    var renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);

    renderTask.promise.then(function() {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });

  document.getElementById('page_num').textContent = num;
}


function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

/**
 * show previous page
 */
function onPrevPage() {
  if (pageNum > 1) {
    pageNum--;
    queueRenderPage(pageNum);
  }
}

document.getElementById('prev').addEventListener('click', onPrevPage);

/**
 * show next page
 */
function onNextPage() {
  if (pageNum < pdfDoc.numPages) {
    pageNum++;
    queueRenderPage(pageNum);
  }
}

document.getElementById('next').addEventListener('click', onNextPage);

/**
 * PDF async "download".
 */
pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
  //Set loaded PDF to main pdfDoc variable
  pdfDoc = pdfDoc_;

  //Show number of pages in document
  document.getElementById('page_count').textContent = pdfDoc.numPages;

  renderPage(pageNum);
});