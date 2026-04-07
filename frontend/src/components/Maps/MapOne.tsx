import jsVectorMap from 'jsvectormap';
import 'jsvectormap/dist/css/jsvectormap.css';
import { useEffect } from 'react';
import '../../js/us-aea-en';
export interface MapOneProps {
  mapData?: { city: string; count: number }[];
}

const MapOne: React.FC<MapOneProps> = ({ mapData = [] }) => {
  useEffect(() => {
    const mapOne = new jsVectorMap({
      selector: '#mapOne',
      map: 'us_aea_en',
      zoomButtons: true,

      regionStyle: {
        initial: {
          fill: '#C8D0D8',
        },
        hover: {
          fillOpacity: 1,
          fill: '#3056D3',
        },
      },
      regionLabelStyle: {
        initial: {
          fontFamily: 'Satoshi',
          fontWeight: 'semibold',
          fill: '#fff',
        },
        hover: {
          cursor: 'pointer',
        },
      },

      labels: {
        regions: {
          render(code: string) {
            return code.split('-')[1];
          },
        },
      },
    });
    mapOne;
  });

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-7">
      <h4 className="mb-2 text-xl font-semibold text-black dark:text-white">
        Enrollments by Location (Hover map for fun)
      </h4>
      <div className="flex flex-col lg:flex-row gap-4">
        <div id="mapOne" className="mapOne map-btn flex-1 h-90"></div>
        {mapData && mapData.length > 0 && (
          <div className="flex flex-col gap-2 w-full lg:w-1/3 bg-gray-50 dark:bg-meta-4 p-4 rounded-md h-90 overflow-y-auto">
            <h5 className="text-md font-semibold text-black dark:text-white border-b pb-2">Top Cities</h5>
            {mapData.sort((a,b) => b.count - a.count).slice(0, 8).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-300 font-medium truncate">{item.city}</span>
                <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapOne;
