// window:load event for Javascript to run after HTML
// because this Javascript is injected into the document head
window.addEventListener('load', () => {
  // Javascript code to execute after DOM content
 
  // full ZingChart schema can be found here:
  // https://www.zingchart.com/docs/api/json-configuration/
  let chartConfig = {
    type: 'pop-pyramid',
    globals: {
      fontSize: '14px'
    },
    title: {
      text: 'Population Pyramid by Age Group',
      fontSize: '24px'
    },
    options: {
      // values can be: 'bar', 'hbar', 'area', 'varea', 'line', 'vline'
      aspect: 'hbar'
    },
    legend: {
      shared: true
    },
    // plot represents general series, or plots, styling
    plot: {
      // hoverstate
      tooltip: {
        padding: '10px 15px',
        borderRadius: '3px'
      },
      valueBox: {
        color: '#fff',
        placement: 'top-in',
        thousandsSeparator: ','
      },
      // animation docs here:
      // https://www.zingchart.com/docs/tutorials/design-and-styling/chart-animation/#animation__effect
      animation: {
        effect: 'ANIMATION_EXPAND_BOTTOM',
        method: 'ANIMATION_STRONG_EASE_OUT',
        sequence: 'ANIMATION_BY_NODE',
        speed: 222
      }
    },
    scaleX: {
      // set scale label
      label: {
        text: 'Age Groups'
      },
      labels: ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80-84', '85-89', '90-94', '95-99', '100+'],
    },
    scaleY: {
      // scale label with unicode character
      label: {
        text: 'Population'
      }
    },
    series: [{
        text: 'Male',
        values: [1656154, 1787564, 1981671, 2108575, 2403438, 2366003, 2301402, 2519874, 3360596, 3493473, 1785638, 1447162, 1005011, 1330870, 1130632, 1121208, 2403438, 3360596, 3493473, 1785638, 1447162],
        // two colors with a space makes a gradient
        backgroundColor: '#4682b4',
        dataSide: 1
      },
      {
        text: 'Female',
        values: [1656154, 1787564, 1981671, 2108575, 2403438, 2366003, 2301402, 2304444, 2426504, 2568938, 1785638, 1447162, 1005011, 1330870, 1130632, 1121208, 2108575, 2301402, 2304444, 2426504, 1568938],
        // two colors with a space makes a gradient
        backgroundColor: '#ee7988',
        dataSide: 2
      }
    ]
  };
 
  // render chart
  zingchart.render({
    id: 'myChart',
    data: chartConfig,
    height: '100%',
    width: '100%',
  });
});