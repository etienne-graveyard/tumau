console.log(window.BENCHMARK_RESULT);

function createElem(type, _props, children) {
  const elem = document.createElement(type);
  const props = _props || {};
  if (props.onClick) {
    elem.addEventListener('click', props.onClick);
  }
  if (props.className) {
    props.className.split(' ').forEach(cls => {
      elem.classList.add(cls);
    });
  }
  if (props.css) {
    Object.keys(props.css).forEach(name => {
      elem.style[name] = props.css[name];
    });
  }
  if (children) {
    if (typeof children === 'string' || typeof children === 'number') {
      elem.innerText = children;
    } else if (Array.isArray(children)) {
      children.forEach(child => {
        if (child !== null && child !== undefined) {
          elem.appendChild(child);
        }
      });
    }
  }
  return elem;
}

const root = document.getElementById('root');

const createColumn = (renderLine, renderHeader = createHeader(''), opts = {}) => {
  const { size = 300, css = {} } = opts;
  return createElem('div', { className: 'column', css: { width: size + 'px', ...css } }, [
    renderHeader(),
    ...window.BENCHMARK_RESULT.map(bench => createElem('div', { className: 'cell' }, [renderLine(bench)])),
  ]);
};

const createHeader = (name, subtitle, align = 'center') => () => {
  return createElem('div', { className: 'headcell' }, [
    createElem('h3', { css: { textAlign: align } }, name),
    subtitle && createElem('p', {}, subtitle),
  ]);
};

const renderCompareCell = (access, head, subtitle, unit) => {
  const max = Math.max(...window.BENCHMARK_RESULT.map(access));
  return createColumn(
    bench => {
      const progress = access(bench) / max;
      const width = progress * 250;
      return createElem('div', { css: { display: 'flex', flexDirection: 'column', alignItems: 'stretch', flex: 1 } }, [
        createElem('p', {}, access(bench).toFixed(2) + ' ' + unit),
        createElem('div', {
          css: {
            height: '5px',
            background: '#311B92',
            width: width + 'px',
            alignSelf: 'flex-start',
            marginTop: '10px',
          },
        }),
      ]);
    },
    createHeader(head, subtitle),
    {}
  );
};

root.appendChild(
  createElem(
    'div',
    {
      className: 'main',
    },
    [
      createColumn(bench => createElem('h2', {}, bench.title), createHeader('name', null, 'right')),
      renderCompareCell(bench => bench.requests.average, 'average requests/s', 'bigger is better', '/s'),
      renderCompareCell(bench => bench.requests.min, 'min requests/s', null, '/s'),
      renderCompareCell(bench => bench.requests.max, 'max requests/s', null, '/s'),
      renderCompareCell(bench => bench.latency.average, 'average latency', 'smaller is better', 'ms'),
      renderCompareCell(bench => bench.latency.max, 'max latency', null, 'ms'),
      renderCompareCell(bench => bench.throughput.average, 'average throughput', 'bigger is better', 'b'),
    ]
  )
);
