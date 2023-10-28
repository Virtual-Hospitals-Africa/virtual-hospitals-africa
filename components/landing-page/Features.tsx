export default function Features() {
  return (
    <div className='bg-white'>
      <div className='mx-auto max-w-2xl px-4 py-24 sm:px-6 sm:py-32 lg:max-w-7xl lg:px-8'>
        <div className='grid grid-cols-1 items-center gap-x-8 gap-y-16 lg:grid-cols-2'>
          <div>
            <div className='border-b border-gray-200 pb-10'>
              <h2 className='font-medium text-gray-500'>Machined Kettle</h2>
              <p className='mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
                Elegant simplicity
              </p>
            </div>

            <dl className='mt-10 space-y-10'>
              <div>
                <dt className='text-sm font-medium text-gray-900'>
                  Sleek design
                </dt>
                <dd className='mt-3 text-sm text-gray-500'>
                  The machined kettle has a smooth black finish and contemporary
                  shape that stands apart from most plastic appliances.
                </dd>
              </div>
              <div>
                <dt className='text-sm font-medium text-gray-900'>
                  Comfort handle
                </dt>
                <dd className='mt-3 text-sm text-gray-500'>
                  Shaped for steady pours and insulated to prevent burns.
                </dd>
              </div>
              <div>
                <dt className='text-sm font-medium text-gray-900'>
                  One-button control
                </dt>
                <dd className='mt-3 text-sm text-gray-500'>
                  The one button control has a digital readout for setting
                  temperature and turning the kettle on and off.
                </dd>
              </div>
              <div>
                <dt className='text-sm font-medium text-gray-900'>
                  Long spout
                </dt>
                <dd className='mt-3 text-sm text-gray-500'>
                  Designed specifically for controlled pour-overs that
                  don&#039;t slash or sputter.
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <div className='aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-100'>
              <img
                src='https://tailwindui.com/img/ecommerce-images/product-feature-09-main-detail.jpg'
                alt='Black kettle with long pour spot and angled body on marble counter next to coffee mug and pour-over system.'
                className='h-full w-full object-cover object-center'
              />
            </div>
            <div className='mt-4 grid grid-cols-2 gap-4 sm:mt-6 sm:gap-6 lg:mt-8 lg:gap-8'>
              <div className='aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-100'>
                <img
                  src='https://tailwindui.com/img/ecommerce-images/product-feature-09-detail-01.jpg'
                  alt='Detail of temperature setting button on kettle bass with digital degree readout.'
                  className='h-full w-full object-cover object-center'
                />
              </div>
              <div className='aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-100'>
                <img
                  src='https://tailwindui.com/img/ecommerce-images/product-feature-09-detail-02.jpg'
                  alt='Kettle spout pouring boiling water into coffee grounds in pour-over mug.'
                  className='h-full w-full object-cover object-center'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
