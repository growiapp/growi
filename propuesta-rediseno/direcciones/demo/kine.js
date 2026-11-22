(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var regions = {
    front: [
      { k: 'cuello', n: 'Cuello', x: 50, y: 15.6, c: ['Molestias al girar la cabeza', 'Tensión después de muchas horas sentado'], p: 'En la evaluación se revisa la movilidad del cuello y la postura de trabajo.' },
      { k: 'hombro', n: 'Hombro', x: 70, y: 21.5, c: ['Molestias al levantar el brazo', 'Volver al gimnasio con indicación'], p: 'En la evaluación se mide el rango de movimiento de ambos hombros.' },
      { k: 'cadera', n: 'Cadera', x: 59, y: 45, c: ['Molestias al caminar o correr', 'Rehabilitación indicada por tu médico'], p: 'En la evaluación se observa cómo apoyás y cómo se mueve la cadera.' },
      { k: 'rodilla', n: 'Rodilla', x: 61, y: 68.5, c: ['Consulta después de una torcedura', 'Rehabilitación indicada por tu médico', 'Molestias al subir escaleras'], p: 'En la evaluación se revisa el recorrido de la articulación y cómo la usás.' },
      { k: 'tobillo', n: 'Tobillo y pie', x: 62.5, y: 90.5, c: ['Consulta después de una torcedura', 'Volver a correr con indicación'], p: 'En la evaluación se prueba el equilibrio y la movilidad del tobillo.' }
    ],
    back: [
      { k: 'cuello', n: 'Cuello', x: 50, y: 15.6, c: ['Molestias al girar la cabeza', 'Tensión después de muchas horas sentado'], p: 'En la evaluación se revisa la movilidad del cuello y la postura de trabajo.' },
      { k: 'espalda alta', n: 'Espalda alta', x: 50, y: 26, c: ['Molestias entre los omóplatos', 'Postura de trabajo'], p: 'En la evaluación se observa la postura y cómo se mueven los omóplatos.' },
      { k: 'zona lumbar', n: 'Zona lumbar', x: 50, y: 38.5, c: ['Molestias en la espalda baja', 'Molestias al estar mucho tiempo sentado'], p: 'En la evaluación se mira el movimiento de la zona lumbar.' },
      { k: 'parte trasera del muslo', n: 'Parte trasera del muslo', x: 60, y: 55, c: ['Molestias después de correr', 'Consulta para volver al deporte'], p: 'En la evaluación se revisa la movilidad de la parte trasera del muslo.' }
    ]
  };
  var side = 'front', cur = regions.front[3];
  var box = $('#hot'), info = $('#info');
  function showInfo(r) {
    cur = r;
    info.querySelector('h2').textContent = r.n;
    info.querySelector('.chips').innerHTML = r.c.map(function (x) { return '<li>' + x + '</li>'; }).join('');
    info.querySelector('.pr').textContent = r.p;
    info.querySelector('.go').textContent = 'Pedir turno por ' + r.n.toLowerCase();
    box.querySelectorAll('.hot').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.k === r.k); });
    setZone(r.k);
  }
  function draw() {
    box.innerHTML = regions[side].map(function (r) {
      return '<button type="button" class="hot" data-k="' + r.k + '" style="left:' + r.x + '%;top:' + r.y + '%" aria-pressed="false" aria-label="' + r.n + '"></button>';
    }).join('');
    document.querySelectorAll('.fig-tools button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.s === side); });
    document.getElementById('fig-front').style.display = side === 'front' ? '' : 'none';
    document.getElementById('fig-back').style.display = side === 'back' ? '' : 'none';
    showInfo(regions[side][side === 'front' ? 3 : 2]);
  }
  box.addEventListener('click', function (e) { var b = e.target.closest('.hot'); if (b) showInfo(regions[side].filter(function (r) { return r.k === b.dataset.k; })[0]); });
  document.querySelector('.fig-tools').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { side = b.dataset.s; draw(); } });

  /* turnero */
  var days = [], d = new Date();
  var names = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  while (days.length < 6) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) days.push(new Date(d)); }
  var dayBox = $('#days');
  dayBox.innerHTML = days.map(function (x, i) { return '<label><input type="radio" name="dia" value="' + i + '"' + (i === 0 ? ' checked' : '') + '><span>' + names[x.getDay()] + '<small>' + x.getDate() + ' ' + months[x.getMonth()] + '</small></span></label>'; }).join('');
  function slots(x) { var a = [], from = x.getDay() === 6 ? 9 : 8, to = x.getDay() === 6 ? 13 : 20; for (var h = from; h < to; h++) a.push(h + ':00'); return a; }
  function busy(i, h) { return ((i * 7 + parseInt(h, 10) * 3) % 5) === 0; }
  function drawSlots() {
    var i = +$('input[name=dia]:checked').value, s = slots(days[i]), first = true;
    $('#slots').innerHTML = s.map(function (h) { var b = busy(i, h), c = !b && first; if (c) first = false; return '<label><input type="radio" name="hora" value="' + h + '"' + (b ? ' disabled' : '') + (c ? ' checked' : '') + '><span>' + h + '</span></label>'; }).join('');
    sum();
  }
  var zone = '';
  function setZone(k) { zone = k; sum(); }
  function sum() {
    var f = document.forms.turno, i = +f.dia.value, h = (f.hora && f.hora.value) || '';
    var x = days[i];
    $('#s-motivo').textContent = zone ? zone.charAt(0).toUpperCase() + zone.slice(1) : 'A definir en la consulta';
    $('#s-tipo').textContent = f.tipo.value;
    $('#s-cuando').textContent = h ? names[x.getDay()] + ' ' + x.getDate() + ' de ' + months[x.getMonth()] + ', ' + h + ' hs' : 'Elegí un horario';
    $('#s-prof').textContent = f.prof.value;
    $('#pedir').disabled = !h;
  }
  document.forms.turno.addEventListener('change', function (e) { if (e.target.name === 'dia') drawSlots(); else sum(); });
  $('#pedir').addEventListener('click', function () {
    var msg = 'Hola, quiero pedir un turno en Alameda Kinesiología.\nMotivo: ' + $('#s-motivo').textContent + '\nConsulta: ' + $('#s-tipo').textContent + '\nProfesional: ' + $('#s-prof').textContent + '\nDía y hora: ' + $('#s-cuando').textContent;
    $('#bubble').textContent = msg;
    $('#dlg').showModal();
  });
  $('#dlg-x').addEventListener('click', function () { $('#dlg').close(); });
  $('.info .go').addEventListener('click', function () { document.getElementById('turno').scrollIntoView({ behavior: 'smooth' }); });
  draw(); drawSlots();
})();
