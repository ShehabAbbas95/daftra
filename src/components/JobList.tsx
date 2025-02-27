import React from "react";

interface Job {
  title: string;
  company: string;
  location: string;
  exp: string;
  type: string;
  last: string;
}

const JobList: React.FC = () => {
  const jobs: Job[] = [
    {
      title: "Gaming UI Design",
      company: "Rockstar Games",
      location: "ElMansoura, Egypt",
      exp: "0 - 3 yrs",
      type: "Full time",
      last: "10 days ago",
    },
    {
      title: "Senior UX UI Designer",
      company: "Egabi",
      location: "Cairo, Egypt",
      exp: "0 - 3 yrs",
      type: "Full time",
      last: "1 month ago",
    },
    {
      title: "React Frontend developer",
      company: "Magara",
      location: "Cairo, Egypt",
      exp: "0 - 3 yrs",
      type: "Full time",
      last: "1 month ago",
    },
  ];

  return (
    <div className="p-6 flex-1">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">UI Designer in Egypt</h1>
        <p className="text-gray-600">{jobs.length} job positions</p>
      </div>

      <div className="space-y-4">
        {jobs.map((job, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-blue-600">{job.title}</h3>
            <p className="font-medium">{job.company}</p>
            <div className="flex justify-between mt-2">
              <p className="text-gray-600">{job.location}</p>
              <p className="text-gray-500">{job.last}</p>
            </div>
            <div className="mt-2 flex gap-2">
              <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                {job.exp}
              </span>
              <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                {job.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobList;
