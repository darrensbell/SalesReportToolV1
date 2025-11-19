import { ResponsiveScatterPlot } from '@nivo/scatterplot'

const AverageTicketPriceChart = ({ data }) => {
  if (!data) return <div>Loading...</div>

  return (
    <div style={{ height: 400 }}>
      <ResponsiveScatterPlot
        data={data}
        margin={{ top: 60, right: 140, bottom: 70, left: 90 }}
        xScale={{ type: 'linear', min: 0, max: 'auto' }}
        yScale={{ type: 'linear', min: 0, max: 'auto' }}
        blendMode="multiply"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          orient: 'bottom',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Days Until Show',
          legendPosition: 'middle',
          legendOffset: 46,
        }}
        axisLeft={{
          orient: 'left',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Average Ticket Price',
          legendPosition: 'middle',
          legendOffset: -60,
        }}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 130,
            translateY: 0,
            itemWidth: 100,
            itemHeight: 12,
            itemsSpacing: 5,
            itemDirection: 'left-to-right',
            symbolSize: 12,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </div>
  )
}

export default AverageTicketPriceChart
