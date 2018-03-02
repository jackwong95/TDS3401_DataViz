function create_globewords()
{
	const canvas = document.getElementById('fb_gb');

	const texts = [
	  'HTML5', 'Javascript', 'Scala', 'Kotlin', 'Erlang',
	  'CSS', 'Python', 'Java', 'PostgreSQL', 'MongoDB',
	  'Android', 'TensorFlow', 'Flask', 'React', 'Redis',
	  'NodeJS', 'OCaml', 'Redux', 'Rx', 'testing', 'only', 
	  'some', 'rand', 'word', 'test', 'fdsf',
	  'fsd', 'hgf', 'fdsa', 'fdsgfd', 'hfg',
	  'fdsafsa', 'fdsag', 'fdsa', 'Reafdsafct', 'fadsf',
	  'fasdfasd', 'hdsa', 'Regdadsfdux', 'hgf', 'fsdfs', 'gfdg'
	];
	const counts = [1,2,4,5,4,2,1,];

	const options = {
	  tilt: Math.PI / 9,
	  initialVelocityX: 0.09,
	  initialVelocityY: 0.09,
	  initialRotationX: Math.PI * 0.14,
	  initialRotationZ: 0
	};

	wordSphere(canvas, texts, counts, {width:500, height:500, radius:100, padding:50});
	//wordSphere(canvas2, texts, counts, options);
}
