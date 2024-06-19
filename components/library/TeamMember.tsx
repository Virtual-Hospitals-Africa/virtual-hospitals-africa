import { JSX } from 'preact';
import Avatar from './Avatar.tsx'; 
import cls from '../../util/cls.ts';

type TeamMemberProps = {
  name: string;
  handle: string;
  imageUrl: string;
  status: 'online' | 'offline';
  description: string;
  href: string;
};

export default function TeamMember({ name, handle, imageUrl, status, description, href }: TeamMemberProps): JSX.Element {
  return (
    <li>
      <div className='group relative flex items-center px-5 py-6'>
        <a href={href} className='-m-1 block flex-1 p-1'>
          <div className='absolute inset-0 group-hover:bg-gray-50' aria-hidden='true' />
          <div className='relative flex min-w-0 flex-1 items-center'>
            <span className='relative inline-block flex-shrink-0'>
              <img className='h-10 w-10 rounded-full' src={imageUrl} alt='' />
              <span
                className={cls(
                  status === 'online' ? 'bg-green-400' : 'bg-gray-300',
                  'absolute right-0 top-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white'
                )}
                aria-hidden='true'
              />
            </span>
            <div className='ml-4 truncate'>
              <p className='truncate text-sm font-bold text-gray-900'>{name}</p>
              <p className='truncate text-sm text-gray-500'>{handle}</p>
              <p className='truncate text-sm text-gray-500'>{description}</p>
            </div>
          </div>
        </a>
      </div>
    </li>
  );
}
