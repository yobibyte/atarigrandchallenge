export FLASK_APP='server.py'
if [ "$1" == "-d" ]
  then 
    export FLASK_DEBUG=1
  else
    export FLASK_DEBUG=0
fi
flask run -h 0.0.0.0 -p 4242
